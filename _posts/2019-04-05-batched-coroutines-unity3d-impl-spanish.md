---
layout: post
section-type: post
title: Implementación de la clase BatchedCoroutines para Unity3D
date:   2019-04-05 16:00:00 +0100
categories: cs-snippet
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/batched-coroutines-unity3d-impl.html"
---

## BatchedCoroutines: Iterar coroutinas una a una

¿Queréis que vuestras ConcurrentQueues se ejecuten una por una? Sin problema, con esta implementación hard-codeada lo conseguiréis:

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

**Ejemplo de implementación:**

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

Básicamente, en las dos Queues vamos haciendo Enqueue donde sea necesario (en otro thread).

Cuando todo haya acabado, desde el primer thread, llamamos a que se ejecute lo que acabo de mostrar.

En mi caso por ejemplo, esto sirve para mostrar pixel a pixel donde se ha iterado una imagen.

Lo siguiente que ocurre es que la imagen se rellena con el algoritmo de flood-fill que mostraré en el próximo post. (Básicamente, para saber si se ha hecho bien)

**Gist:** https://gist.github.com/z3nth10n/518d100795b28528f5a4ae9e8a0b5b4e

**¡Un saludo!**