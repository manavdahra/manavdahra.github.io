# My Journey Through the ML Rabbit Hole

Everyone seems to have a story about the moment they discovered machine learning. Mine starts in the late 2010s, when ML fever was sweeping through tech communities and the field was finally stepping out of academia into the real world.

### Caught in the Hype

In 2018, I discovered Andrew Ng's online course and started working through topics like supervised learning, backpropagation, loss functions, and gradient descent. It was a solid introduction. For the first time, AI felt accessible and structured.

But here's the thing: it was *too* simple. The course gave me a taste without the depth, a map without the terrain. Looking back, I recognize it for what it was: a strong introductory course that points toward deeper study. I already knew my understanding was surface level, so I moved to Kaggle exercises to try and cement it.

For a while, that felt productive, but eventually I got stuck and wasn't sure what the next step should be.

### The Reality Check

Armed with my newfound "knowledge," I headed to Kaggle. The Titanic dataset, housing prices, handwritten digits: classic beginner problems. I followed the template faithfully: load data, shuffle, normalize, split, build a neural net, train it, check the loss curve, celebrate.

And it worked. Sort of.

The models converged. The accuracy looked decent on paper. But I felt nothing except a nagging emptiness. I was a kid assembling Lego blocks without understanding why they stuck together. I could make things work, but I couldn't explain *why* they worked or why they didn't.

The real crisis came when my model didn't converge on a dataset that looked like all the others. Or when changing the train-test split by a few percent tanked performance. Or when I swapped cross-entropy loss for MSE and got wildly different results. Each failure spawned the same question: **why?**

And I had no answer.

I'd search online and usually end up in rabbit holes of linear algebra, information theory, and Wikipedia articles about topics I'd never heard of. Hours would pass, and I often came away more confused than before. Eventually, I'd pause and move on to the next Kaggle problem, while the same questions stayed unresolved.

### The Turning Point

I eventually realized I'd been approaching ML all wrong.

Traditional software engineering taught me a powerful lesson: to truly understand complex systems like databases, compilers, and network protocols, you build them from scratch. Writing your own TCP stack or database engine forces you to confront every design decision, every tradeoff. By the time you're done, the system isn't mysterious anymore.

But machine learning is different. You can implement backpropagation from first principles, hand-code every matrix multiplication, gather your own dataset, tune hyperparameters until your eyes water and *still* have no idea why your model sometimes fails spectacularly on new data. You can know the mechanics perfectly and understand nothing about the system's actual behavior.

The harsh truth: **there are no shortcuts.** You can't just build your way to understanding ML. You need to ground yourself in theory: real mathematical theory. Linear Algebra. Information theory. Statistics. Optimization. The concepts that underpin why these algorithms work (or don't).

I watched the ML influencer circuit on Twitter promise quick wins and 10-hour mastery courses. None of it resonated with my experience. My engineering background had taught me the opposite lesson: just like software engineering is grounded in DSA, system design, and distributed systems, ML should also be approached in a principled way. The challenge was that the knowledge was often available in silos and hard to connect without sustained effort.

### Taking the Leap

That realization changed everything. I stopped chasing quick wins and committed to doing this properly. 

In April 2026, I enrolled in [CS 229](https://online.stanford.edu/courses/cs229-machine-learning), Stanford's graduate machine learning course, the same program that Andrew Ng's online course was designed to feed into. This time, I went in with eyes wide open: no illusions, no shortcuts, just a readiness to confront the material head-on.

Those three months fundamentally shifted how I think about machine learning.

### What CS 229 Actually Taught Me

Remember all those unanswered questions from my Kaggle days? [CS 229](https://online.stanford.edu/courses/cs229-machine-learning) didn't just answer them. It showed me why I was even asking the wrong questions in the first place.

When I asked "Do I really need normalization?" the course answered with statistical intuition and convergence theory. When I wondered why cross-entropy loss worked better than MSE for classification, I finally learned about maximum likelihood estimation and information theory. Those Wikipedia rabbit holes that once seemed chaotic? They suddenly formed a coherent landscape once I had the theoretical map.

The real revelation came when I understood the bias-variance tradeoff not as a concept to memorize, but as a fundamental principle that explains *why* your model breaks. Why changing the train-test split matters. Why your loss curves behave the way they do. Backpropagation wasn't just a clever algorithm anymore. It was a consequence of calculus and optimization theory.

For the first time, I could debug a ML system because I understood the principles underneath.

### The Difference This Time

The irony is stark: [CS 229](https://online.stanford.edu/courses/cs229-machine-learning) isn't fundamentally different from Andrew Ng's online course in terms of content. But everything else is different.

The difference is rigor. The difference is working through problem sets that force you to implement ideas from scratch and explain why they work. The difference is understanding that ML isn't a toolkit; it's a discipline built on mathematics and statistics.

Most importantly, the difference is mindset. Even the first time, I was looking for a principled approach rather than a shortcut. Over time, I learned that while most of the core knowledge is available, it is fragmented and takes years of dedicated effort to truly absorb. This time, I was better prepared for that long game.

### Why This Series Exists

So now, as I finish [CS 229](https://online.stanford.edu/courses/cs229-machine-learning) in June 2026, I'm writing this series of blog posts for a specific audience: people who feel the way I felt. People who know something is missing from the quick-start tutorials. People who are ready to go deeper but don't know where to start.

I'm not here to replace [CS 229](https://online.stanford.edu/courses/cs229-machine-learning) or rigorous textbooks. But I can be your companion as you work through them. I can share what clicked for me, the experiments that crystallized my understanding, the resources that helped cut through the confusion. I'll write about the math without apology, because that's where the real understanding lives.

This series documents my transition from cookbook ML practitioner to someone with a stronger foundation. It's less a before-and-after story and more an ongoing conversation between earlier confusion and better, but still evolving, understanding.

If you're tired of feeling like you're just assembling Lego blocks, if you're ready to actually understand why these systems work the way they do, then let's explore this together.

Thanks for reading. The real work starts next.
