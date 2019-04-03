---
layout: post
section-type: post
title: Implementación de la clase ThreadSafeBool para Unity3D
date:   2019-04-03 16:00:00 +0100
categories: cs-snippet
language: es
locale: 'es'
permalink: "/:language/:year/:month/:day/thread-safe-bools-unity3d-impl.html"
---

El otro día me pasaba que al asignar una variable que estaba declarada en ambito de la clase desde otro thread, al leerla desde otro thread no me devolvía el resultado esperado, por eso os traigo esta utilidad:

```csharp
using System.Threading;
 
namespace GTAMapper.Extensions.Threading
{
    /// <summary>
    /// Thread safe enter once into a code block:
    /// the first call to CheckAndSetFirstCall returns always true,
    /// all subsequent call return false.
    /// </summary>
    public class ThreadSafeBool
    {
        private static int NOTCALLED = 0,
                           CALLED = 1;
 
        private int _state = NOTCALLED;
 
        /// <summary>Explicit call to check and set if this is the first call</summary>
        public bool Value
        {
            get
            {
                return Interlocked.Exchange(ref _state, CALLED) == NOTCALLED;
            }
        }
 
        /// <summary>usually init by false</summary>
        public static implicit operator ThreadSafeBool(bool called)
        {
            return new ThreadSafeBool() { _state = called ? CALLED : NOTCALLED };
        }
 
        public static implicit operator bool(ThreadSafeBool cast)
        {
            if (cast == null)
                return false;
 
            return cast.Value;
        }
    }
}
```

**Gist:** https://gist.github.com/z3nth10n/052e6660c392d6a4e48290e9a6ae36f8

**Extraído de:** https://www.codeproject.com/Tips/375559/Implement-Thread-Safe-One-shot-Bool-Flag-with-Inte

**¡Un saludo!**