---
layout: post
section-type: post
title: BatchedCoroutines class implementation for Unity3D
date:   2019-04-05 16:00:00 +0100
categories: cs-snippet
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/batched-coroutines-unity3d-impl.html"
---

## BatchedCoroutines: Iterar coroutinas one by one

Do you want your ConcurrentQueues to be executed one by one? No problem, with this hard-coded implementation you will get it:

```csharp
using GTAMapper.Extensions.Threading;
using System;
using System.Collections;
using UnityEngine;
 
namespace GTAMapper.Extensions
{
    public static class BatchedCoroutines
    {
        public static IEnumerator BatchCoroutines(
            MonoBehaviour monoBehaviour,
            Action finish,
            Func<int, bool>[] waitUntil = null,
            params Tuple<Action<object>, ConcurrentQueuedCoroutines<object>>[] tuple) // Tuple<Action<T>, ConcurrentQueuedCoroutines<T>> || dynamic
                                                                                      // Fix for: https://stackoverflow.com/questions/15417174/using-the-params-keyword-for-generic-parameters-in-c-sharp
        {
            int i = 0;
 
            foreach (var val in tuple)
            {
                if (waitUntil != null && waitUntil[i] != null)
                    yield return new WaitUntil(() => waitUntil[i](i));
 
                yield return val.Item2.GetCoroutine(monoBehaviour, val.Item1);
 
                ++i;
            }
 
            finish?.Invoke();
        }
    }
}
```

**Example of use:**

```csharp
namespace GTAMapper.Core {
    public class Program : MonoBehaviour {
        protected ConcurrentQueuedCoroutines<object> debuggingCoroutine = new ConcurrentQueuedCoroutines<object>(),
                                                     colorCoroutine = new ConcurrentQueuedCoroutines<object>();
    
        public void Start() {
        StartCoroutine(BatchedCoroutines.BatchCoroutines(
                this,
                () => areCoroutinesCollected = true,
                F.GetFuncs(null, (_ii) => debuggingCoroutine.Queue.Count > 0),
                new Tuple<Action<object>, ConcurrentQueuedCoroutines<object>>((obj) =>
                {
                    Tuple<int, Color> tuple = (Tuple<int, Color>)obj;
 
                    int i = tuple.Item1,
                            _x = i % width,
                            _y = i / width;
 
                    UnityEngine.Color actualColor = debugTexture.GetPixel(_x, _y),
                                      mixedColor = UnityEngine.Color.Lerp(actualColor, tuple.Item2, .5f);
 
                    if (actualColor != mixedColor)
                    {
                        debugTexture.SetPixel(_x, _y, mixedColor);
                        debugTexture.Apply();
                    }
                }, colorCoroutine),
                new Tuple<Action<object>, ConcurrentQueuedCoroutines<object>>((obj) =>
                {
                    Color[] colors = (Color[])obj;
 
                    debugTexture.SetPixels32(colors.CastBack().ToArray());
                    debugTexture.Apply();
                }, debuggingCoroutine)));
          }
     }
}
```

```csharp
using System;
 
public static class F {
        public static Func<int, bool>[] GetFuncs(params Func<int, bool>[] waitUntil)
        {
            return waitUntil;
        }
}
```

Basically, in the two Queues we are doing Enqueue where necessary (in another thread).

When everything is finished, from the first thread, we call to execute what I just showed.

In my case, for example, this serves to show pixel by pixel where an `Texture2D` has been iterated.

The next thing that happens is that the image is filled with the flood-fill algorithm that I will show in the next post. (Basically, to know if it was done well)

**Gist:** https://gist.github.com/z3nth10n/518d100795b28528f5a4ae9e8a0b5b4e

**Best regards!**