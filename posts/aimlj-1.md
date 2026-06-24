# My Journal on AI/ML 

This is my journal on learnings I have had with AI/ML so far.

### The fad

Like many, I got deeply curious about Machine learning back in the late 2010s. The field of ML was newly commercialized and sat at the fringes of Software Engineering ecosystem. Actually, with launch of AlexNet in early 2010s, it had already heated up I was just not aware of it. But I digress... 

In 2018, I got introduced to Deep learning by Andrew Ng's online courses. The excitement took over me and I jumped straight into the course. I went through supervised/un-supervised learning, SGD, linear/logistic regression, loss functions, backpropagation, etc etc on a very high level and it was great introduction for beginners like me. But that is all it was -- "an introduction". I now see that course was designed to be a PR campaign for attracting students into Stanford's AI/ML program. Don't get me wrong, there is nothing wrong with a great introduction and helping prospective students find a great course they like. But in 2026, the introductory course shouldn't be the place where most of us should stop and say, we learnt ML. It's nowhere close.

### The doubt

Once I was done with the course, I tried my hands at Kaggle and tried building some models for problems like titanic survivors, housing prices and identifying hand-written digits. I had a few successes here and there but I wasn't really happy with the outcome. I didn't know what I was really doing apart from following some steps written in a cookbook/recipe and this software engineering mindset -- "get your hands dirty, build things to learn fast" was restricting my growth. I now think that this approach is not ideal for learning ML. 

Everytime, I'd end up building some model I'd be doing something like -

1. Collect data
2. Pre-process it - one-hot encode/shuffle/split/normalise
3. Code up the model 
4. Train the model using the loss function           
5. Test it against test split 
6. Plot loss curves and celebrate :party:

Why ? because that is what the cookbook says and more or less it is correct. 

But by the end of it I was often left with more questions than answers.

- "What happens if I change the train-test split ? At what limit of this ratio does my model break ? And why ?"
- "Do I really need normalisation ? How do I even see the difference ?"
- "Why shuffle ?"
- "The loss function looks like we pulled something out of thin air. What is CE loss ? Why wouldn't MSE work ? Why is entropy here ?"
- "What is all this fuss about backpropagation ? Looks like a simple chain rule to me."
- "Weird... I though Neural nets and SGD train well and achieve good accuracy, the training loss is not decreasing for me"

For most questions, when I'd try to dig further, it would lead me down in a Wikipedia rabbit hole with complex math and more hyperlinks that I didn't understand and spend hours learning un-related things eventually to give up.

> In short, I didn't know how to debug a ML system while lacking the knowledge of first principles.

### First principles first

I had grossly underestimated the nuance, richness and difficulty of ML. Unlike software engineering where epxplicit rules are written to guide the behaviour of the system and build abstractions to isolate and hide this complexity, ML doesn't work that way.

In past if I wanted to learn more about a complex system like databases or HTTP servers, then I'd just write them by hand to reinforce a better understanding. Whereas, in ML, its only half of the story. I could implement SGD algorithm from scratch, build a model layer by layer, gather data, train it to achieve high accuracy and still not understand why my model fails to achieve high accuracy. (Clearly I was unaware of concepts like model selection, hyper-parameter tuning, regularization, bias-variance tradeoff)

> To understand why ML systems fail in obscure ways, you must know more than the steps in a cookbook.

There are no shortcuts to this. The internet is filled with too many online courses and ML gurus who say otherwise, but I strongly disagree with those opinions as it never worked out for me and this is what motivates me to write a series of blog post about it. 

### What now ?

I have been taking my sweet time to learn the necessary theory ML and in the process of writing these detailed blog posts, I expect to not only guide others in the right direction but also reinforce my own understanding.

In next few blog posts, I'll write more in detail and unlike other materials, I won't shy away from writing Math. I'll also drop in some links to free ebooks, research papers and my experiments or replications. Hopefully you are as excited as I am!

Thank you for reading!
