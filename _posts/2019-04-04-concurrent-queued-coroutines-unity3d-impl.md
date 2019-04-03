---
layout: post
section-type: post
title: ConcurrentQueuedCoroutines class implementation for Unity3D
date:   2019-04-04 16:00:00 +0100
categories: cs-snippet
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/concurrent-queued-coroutines-unity3d-impl.html"
---

## ConcurrentQueuedCoroutines: Thread-Safe Implementation of ConcurrentQueues within Coroutinas

The idea of this utility is that when you store items from another thread, you can access it from the main thread.

Mixing this idea with the Coroutinas, which are a prehistoric system that Unity3D implemented in its moment. It works as follows: an IEnumerator is created (with a `yield return` statment), which each MoveNext executes in each frame (yield return null) or when the programmer specifies (`yield return new WaitForSeconds(3)` equivalent to `Thread.Sleep (3000)`) (this avoid that the main thread blocks, and yes, for those who ask, Unity3D engine is still implemented to run on a single thread).

So, having these 2 things, why not do Dequeue on each MoveNext?

```csharp
using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using UnityEngine;
 
namespace GTAMapper.Extensions.Threading
{
    public class ConcurrentQueuedCoroutines<T>
    {
        private List<Coroutine> coroutines;
        private Coroutine coroutine;
        private MonoBehaviour Mono;
 
        public ConcurrentQueue<object> Queue { get; private set; }
 
        public Action<T> Action { get; private set; }
        public bool Debugging { get; set; }
        public float SecondsToWait { get; private set; }
 
        private ConcurrentQueuedCoroutines()
        {
        }
 
        public ConcurrentQueuedCoroutines(float secondsToWait = -1)
        {
            Queue = new ConcurrentQueue<object>();
            coroutines = new List<Coroutine>();
            SecondsToWait = secondsToWait;
        }
 
        public Coroutine StartCoroutine(MonoBehaviour monoBehaviour, Action<T> action)
        {
            coroutines.Add(monoBehaviour.StartCoroutine(InternalCoroutine()));
            Mono = monoBehaviour;
            Action = action;
 
            return coroutine;
        }
 
        public Coroutine StartCoroutineOnce(MonoBehaviour monoBehaviour, Action<T> action)
        {
            if (Debugging)
                Debug.Log("Starting dequeing!");
 
            if (coroutine == null)
            {
                coroutine = monoBehaviour.StartCoroutine(InternalCoroutine());
                Mono = monoBehaviour;
                Action = action;
            }
 
            return coroutine;
        }
 
        public void StopCoroutine()
        {
            if (coroutine != null && Mono != null)
                Mono.StopCoroutine(coroutine);
        }
 
        public void StopAllCoroutines()
        {
            if (Mono != null && coroutines != null && coroutines.Count > 0)
                coroutines.ForEach((c) => Mono.StopCoroutine(c));
        }
 
        public IEnumerator GetCoroutine(MonoBehaviour mono, Action<T> action)
        {
            Mono = mono;
            Action = action;
            return InternalCoroutine();
        }
 
        private IEnumerator InternalCoroutine()
        {
            if (Debugging)
                Debug.Log($"Starting dequeing {Queue.Count} values!");
 
            while (Queue.Count > 0)
            {
                object value = null;
                bool dequeued = Queue.TryDequeue(out value);
 
                if (!dequeued)
                {
                    if (SecondsToWait == -1)
                        yield return new WaitForEndOfFrame();
                    else
                        yield return new WaitForSeconds(SecondsToWait);
 
                    continue;
                }
 
                Action?.Invoke((T)value);
 
                if (SecondsToWait == -1)
                    yield return new WaitForEndOfFrame();
                else
                    yield return new WaitForSeconds(SecondsToWait);
            }
        }
    }
}
```

**Gist:** https://gist.github.com/z3nth10n/060ef9a604095d927c6cd278a49b8262

**Example of use (looping a texture's pixels):**

![](https://i.imgur.com/ekIIGrO.gif)

![](https://i.imgur.com/wX0sTIe.gif)

**Best regards!**