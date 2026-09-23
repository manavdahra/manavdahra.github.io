# Principal component analysis (PCA)

I want to discuss another important topic in machine learning, which is Principal Component Analysis (PCA). PCA is a statistical technique that is used for dimensionality reduction while preserving as much variance as possible in the data. It transforms the original features into a new set of uncorrelated features called principal components.

> You may ask, why do we do this ?

The reason is that transforming features into uncorrelated features allows us to break down the problem into smaller pieces and reason about them independently. 

If you remember from my previous post on [Logistic Regression](/blog/aimlj-5-logistic-regression), we trained a model to predict whether a patient has breast cancer or not based on the 30 features of the [Wisconsin Breast Cancer dataset](https://huggingface.co/datasets/mnemoraorg/wisconsin-breast-cancer-diagnostic). Holding a mental model of all these features interacting with each other to give a result of Malign or Benign is intractable if you are not a domain expert in the field. Our logistic regression model somehow captures those nuances but we don't know how to reason about it. 

So imagine you share this trained model with your team in the organisation and you get bombarded with following questions: 

> What is really going on with this model? Is it really predicting breast cancer, or just memorizing the data? If we bring in a new patient, how can we be sure that the model will predict correctly?

These are all valid questions, and to answer them with some confidence, we need to understand the data better. PCA is one of the many tools to analyse the data. What it will do is show us the *structure* of the data the model is learning from: which directions carry the most information, and whether the two tumor classes even separate in a lower-dimensional view. 

Now, I used 2 phrases - "directions which carry most information" and "whether the two classes even separate in lower dimensional view". These are not wishy-washy statements. Let me demonstrate using some math.


### Directions carrying most information

Imagine we have 2 random variables $X, Y \in \R^n$ and we compute the expectation of product of random variables minus their expected value, we get following

$$
\text{Cov}(X, Y) = \mathbb{E}[X - \mathbb{E}[X]] \mathbb{E}[Y - \mathbb{E}[Y]]\\ = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y]
$$

Think about what this expression is really doing, if we think of these R.V. in terms of vectors, then we are essentially computing an dot product. The higher the dot product, the more closely aligned they are. Hence, more closely correlated they are. 

<details>
    <summary>See dot product if you don't remember</summary>
    $$
        \vec{v} \cdot \vec{u} = |\vec{v}||\vec{u}|\cos(\theta)
    $$

    and, 
    $$
        r = \frac{\vec{v} \cdot \vec{u}}{|\vec{v}||\vec{u}|} = \cos(\theta)
    $$

    is similar to 
    $$
        \text{Cov}(X, Y) = \frac{1}{N-1} \sum_{i=1}^N (X - \bar{X})(Y - \bar{Y})
    $$
</details>

> Now, what happens if we take $Y = X$ ? 

$$
\text{Cov}(X, X) = \mathbb{E}[(X - \mathbb{E}[X])(X - \mathbb{E}[X])^T]\\
= \mathbb{E}[(X - \mathbb{E}[X])(X^T - \mathbb{E}[X]^T)]\\
= \mathbb{E}[(XX^T - \mathbb{E}[X]X^T - X \mathbb{E}[X]^T + \mathbb{E}[X]\mathbb{E}[X]^T]\\
= \mathbb{E}[XX^T] - \mathbb{E}[X]\mathbb{E}[X^T] - \mathbb{E}[X]\mathbb{E}[X^T] + \mathbb{E}[X]\mathbb{E}[X]^T\\
= \mathbb{E}[XX^T] - \mathbb{E}[X]\mathbb{E}[X^T]
$$

PCA is an unsupervised technique for dimensionality reduction that preserves as much variance as possible in the data, transforming the original features into a new set of uncorrelated features called principal components.

In this post, we will reduce the 30 features down to 2, visualize the result, and see why the principal components are orthogonal. Under the hood, we will compute them the same way PCA is always computed - through the eigendecomposition of the covariance matrix (or equivalently, the SVD of the centered data) - building directly on the linear algebra we developed in the earlier posts.

## Mathematical formulation

These blogs don't shy away from the math, so let's get into it.
