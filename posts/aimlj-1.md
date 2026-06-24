# My Journal on AI/ML 

This journal documents my learning journey in AI/ML.

### The fad

Like many, I got deeply curious about Machine learning back in the late 2010s. The field of ML was newly commercialized and sat at the fringes of the Software Engineering ecosystem. Actually, with the launch of AlexNet in the early 2010s, it had already heated up—I was just not aware of it. But I digress... 

In 2018, I got introduced to Deep learning by Andrew Ng's online courses. The excitement took over me and I jumped straight into the course. I went through supervised/unsupervised learning, SGD, linear/logistic regression, loss functions, backpropagation, and more at a very high level. It was a great introduction for beginners like me. But that is all it was -- "an introduction". I now see that the course was designed as a PR campaign for attracting students into Stanford's AI/ML program. Don't get me wrong, there is nothing wrong with a great introduction and helping prospective students find a great course they like. But in 2026, an introductory course shouldn't be where most of us stop and declare we've learned ML. It's nowhere close.

### The doubt

After completing the course, I tried my hand at Kaggle and built models for problems like titanic survivors, housing prices, and identifying handwritten digits. I had some successes, but I wasn't happy with the results. I wasn't truly understanding what I was doing—just following cookbook recipes. My software engineering mindset of "get your hands dirty and build things to learn fast" was actually restricting my growth. I now think that this approach is not ideal for learning ML. 

Every time I'd build a model, I'd follow a predictable pattern:

1. Collect data
2. Pre-process it - one-hot encode/shuffle/split/normalise
3. Code up the model 
4. Train the model using the loss function           
5. Test it against test split 
6. Plot loss curves and celebrate

Why? Because that's what the cookbook says, and it was roughly correct. 

But by the end of it I was often left with more questions than answers.

- "What happens if I change the train-test split? At what ratio does my model break? And why?"
- "Do I really need normalization? How do I even see the difference?"
- "Why shuffle?"
- "The loss function seems pulled out of thin air. What is CE loss? Why not MSE? Why is entropy involved?"
- "What's all this fuss about backpropagation? Looks like simple calculus."
- "Strange... I thought neural networks and SGD would train well and achieve good accuracy, yet my training loss isn't decreasing"

When I'd try to dig deeper, I'd fall down Wikipedia rabbit holes of complex math and hyperlinks I didn't understand, spending hours on tangential topics before giving up.

> In short, I didn't know how to debug a ML system while lacking the knowledge of first principles.

### First principles first

I had grossly underestimated the nuance, richness and difficulty of ML. Unlike software engineering, where explicit rules guide system behavior and abstractions isolate complexity, ML doesn't work that way.

In past if I wanted to learn more about a complex system like databases or HTTP servers, then I'd just write them by hand to reinforce a better understanding. Whereas, in ML, its only half of the story. I could implement the SGD algorithm from scratch, build a model layer by layer, gather data, and train it to high accuracy—yet still not understand why it sometimes failed to generalize. (Clearly I was unaware of concepts like model selection, hyper-parameter tuning, regularization, bias-variance tradeoff)

> To understand why ML systems fail in obscure ways, you must know more than the steps in a cookbook.

There are no shortcuts to this. The internet is filled with online courses and self-proclaimed ML gurus who claim shortcuts exist, but I strongly disagree. This experience motivates me to write a series of detailed blog posts on the subject. 

### What now ?

I have been taking my sweet time to learn the necessary theory ML and in the process of writing these detailed blog posts, I expect to not only guide others in the right direction but also reinforce my own understanding.

In the next few blog posts, I'll write in detail and, unlike much of the available material, won't shy away from mathematics. I'll also drop in some links to free ebooks, research papers and my experiments or replications. Hopefully you are as excited as I am!

Thank you for reading!
