---
layout: post
section-type: post
title: Implementación de la clase ConcurrentQueuedCoroutines para Unity3D
date:   2019-04-04 16:00:00 +0100
categories: cs-snippet
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/concurrent-queued-coroutines-unity3d-impl.html"
---

## ConcurrentQueuedCoroutines: Implementación Thread-Safe de ConcurrentQueues dentro de Coroutinas

La idea de esta utilidad es que cuando tu almacenas items desde otro thread, puedas acceder desde el thread principal.

Mezclando esta idea, con coroutinas, que básicamente, es un sistema del prehistorico que implementó Unity en su momento. Funciona de la siguiente manera: se crea un IEnumerator (con yields), el cual cada MoveNext se ejecuta en cada frame (yield return null) o cuando el programador especifique (yield return new WaitForSeconds(3) equivalente a Thread.Sleep(3000)) (por tal de no bloquear el hilo principal. Y sí, para aquellos que se lo pregunten Unity todavía se ejecuta en un solo hilo).

Entonces, teniendo estas 2 cosas, ¿por qué no hacer Dequeue en cada MoveNext?

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

**Ejemplo de uso (recorriendo una textura):**

![](https://i.imgur.com/ekIIGrO.gif)

![](https://i.imgur.com/wX0sTIe.gif)

**¡Un saludo!**