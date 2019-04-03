---
layout: post
section-type: post
title: Named Thread & Thread Marked class implementation for Unity3D
date:   2019-04-06 16:00:00 +0100
categories: cs-snippet
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/named-thread-thread-unity3d-impl.html"
---

These are two scripts that I use to name the Threads, so when I run a [`ThreadPool.QueueUserWorkItem`](https://docs.microsoft.com/en-us/dotnet/api/system.threading.threadpool.queueuserworkitem?view=netframework-4.7.2) (for example) I can know the name of the Queue.

```csharp
using System;
using System.Collections.Generic;
using System.Threading;
 
namespace GTAMapper.Extensions.Threading
{
    public class ThreadMarker : IDisposable
    {
        //[ThreadStatic]
        //private static string __Name = $"Unity Thread #{Thread.CurrentThread.ManagedThreadId}";
 
        private static Dictionary<int, string> ThreadNames = new Dictionary<int, string>();
 
        public static string Name
        {
            get
            {
                lock (ThreadNames)
                {
                    try
                    {
                        return ThreadNames[Thread.CurrentThread.ManagedThreadId];
                    }
                    catch
                    {
                        return $"Unity Thread #{Thread.CurrentThread.ManagedThreadId}";
                    }
                }
            }
        }
 
        public ThreadMarker(string name)
        {
            lock (ThreadNames)
            {
                ThreadNames.AddOrSet(Thread.CurrentThread.ManagedThreadId, name);
            }
 
            // __Name = name;
        }
 
        public void Dispose()
        {
            ThreadNames.Remove(Thread.CurrentThread.ManagedThreadId);
            // __Name = "Un-Owned";
        }
    }
}
```

```csharp
using System;
 
namespace GTAMapper.Extensions.Threading
{
    public class NamedHandler<TArg>
    {
        public readonly Func<string, TArg> Handler;
 
        public NamedHandler(Func<string, TArg> handler)
        {
            Handler = arg =>
            {
                using (new ThreadMarker(arg))
                {
                    return handler(arg);
                }
            };
        }
    }
}
```

**Example:**

```csharp
int TaskId = new Random().Next();
 
ThreadPool.QueueUserWorkItem(new NamedHandler<WaitCallback>(name => new WaitCallback(BackgroundRunner)).Handler($"Ninja #{TaskId}"));
```

At this moment, from the `BackgroundRunner` method you could access the name of the mentioned `NamedHandler` object.

**Gist:** https://gist.github.com/z3nth10n/d64f669d844bd71dabef8861c88f2b99

**Best regards!**