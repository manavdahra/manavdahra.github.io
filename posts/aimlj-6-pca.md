# Principal component analysis (PCA)

I want to discuss another important topic in machine learning, which is Principal Component Analysis (PCA). PCA is a statistical technique that is used for dimensionality reduction while preserving as much variance as possible in the data. It transforms the original features into a new set of uncorrelated features called principal components.

> You may ask, why do we do this ?

The reason is that transforming features into uncorrelated features allows us to break down the problem into smaller pieces and reason about them independently. 

If you remember from my previous post on [Logistic Regression](/blog/aimlj-5-logistic-regression), I trained a model to predict whether a patient has breast cancer or not based on the 30 features of the [Wisconsin Breast Cancer dataset](https://huggingface.co/datasets/mnemoraorg/wisconsin-breast-cancer-diagnostic). Holding a mental model of all these features interacting with each other to give a result of Malign or Benign is intractable if you are not a domain expert in the field. Our logistic regression model somehow captures those nuances but I don't know how to reason about it. 

So imagine you share this trained model with your team in the organisation and you get bombarded with following questions: 

> What is really going on with this model? Is it really predicting breast cancer, or just memorizing the data? If we bring in a new patient, how can we be sure that the model will predict correctly?

These are all valid questions, and to answer them with some confidence, we need to understand the data better. PCA is one of the many tools to analyse the data. What it will do is show us the *structure* of the data the model is learning from: which directions carry the most information, and whether the two tumor classes even separate in a lower-dimensional view. 

Now, I used 2 phrases - "directions which carry most information" and "whether the two classes even separate in lower dimensional view". These are not wishy-washy statements. Bear with me and I will demonstrate what I mean.

### Digression: Co-Variance and Variance

Imagine we have 2 random variables $X, Y \in \R^n$ with $\mathbb{E}[X], \mathbb{E}[Y]$ as their mean values. Then their co-variance is given by

$\Sigma_{XY} = \text{Cov}(X, Y) = \mathbb{E}[X - \mathbb{E}[X]] \cdot \mathbb{E}[Y - \mathbb{E}[Y]]$

which evaluates to $\Sigma_{XY} = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y]$

To get an intuition of the expression $\mathbb{E}[X - \mathbb{E}[X]] \cdot \mathbb{E}[Y - \mathbb{E}[Y]]$, think of it in terms of vectors, we are essentially computing an dot product. The higher the dot product, the more closely aligned they are. Hence, more closely correlated the random variables $X, Y$ are. 

<details>
    <summary>See dot product and how its related</summary>
    $$
        \vec{v} \cdot \vec{u} = |\vec{v}||\vec{u}|\cos(\theta)
    $$

    and, 
    $$
        \cos(\theta) = \frac{\vec{v} \cdot \vec{u}}{|\vec{v}||\vec{u}|}
    $$

    is similar to 
    $$
        \text{Cov}(X, Y) = \frac{1}{N-1} \sum_{i=1}^N (X - \bar{X})(Y - \bar{Y})
    $$

    $$
    \vec{v} \sim X - \bar{X}\\
    \vec{u} \sim Y - \bar{Y}\\
    \cos(\theta) \sim \text{Cov}(X, Y)
    $$
</details>

> Now, what happens if we take $Y = X$ ? 

$$
\Sigma_{XX} = \mathbb{E}[(X - \mathbb{E}[X]) \cdot (X - \mathbb{E}[X])^T]\\
= \mathbb{E}[XX^T] - \mathbb{E}[X]\mathbb{E}[X^T]
$$

There are some nice properties of $\Sigma_{XX}$.

1. It is symmetric, i.e. $\Sigma_{XX} = \Sigma_{XX}^T$
2. Diagonal elements are simply $\text{Var}(X_i)$ terms.
3. Off-diagonal elements describe how each pair $(X_i, X_j)$ vary wrt each other. 
4. And, $tr(\Sigma_{XX}) = \sum_{i} Var(X_i)$

## Directions carrying most information

> Now, imagine that we want to compress random variable $X \in \R^n$ into $X' \in \R^k$ where $k << n$ and still want to retain most of the variance. How can we do this ?

We first center $X$ by computing $Z = X - \mu$ which gives us $\mathbb{E}[Z] = 0$. (We could also scale each feature by its standard deviation, which is a good idea when features are on wildly different scales - but it doesn't change the structure of the derivation, so let's keep it simple.)

and it can be shown that,
$$
\Sigma = \mathbb{E}[ZZ^T]\\
= \frac{1}{n} \sum_{i=1}^{n} Z^{(i)} (Z^{(i)})^T
$$

where $Z^{(i)} \in \R^n$ is the i-th (centered) datapoint written as a column vector.

And so if we pick a unit vector direction $u \in \R^n$ and project $Z$ on it we get the projection $(Z^{(i)})^T u$ of i-th centered datapoint.

therefore, taking an average of squared projections over all datapoints gives us
$$
\frac{1}{n} \sum_{i=1}^{n} ((Z^{(i)})^T u)^2 = \frac{1}{n} \sum_{i=1}^{n} ((Z^{(i)})^T u)^T ((Z^{(i)})^T u)\\
= \frac{1}{n} \sum_{i=1}^{n} u^T (Z^{(i)} (Z^{(i)})^T) u\\
= u^T \left( \frac{1}{n} \sum_{i=1}^{n} Z^{(i)} (Z^{(i)})^T \right) u\\
= u^T \Sigma u
$$

So the variance captured along direction $u$ is exactly $u^T \Sigma u$. Now, given the constraint $||u||_2 = 1$, our problem becomes:

$$
u_1 = \argmax_{||u||_2 = 1} \; u^T \Sigma u
$$

This is a constrained optimization problem, and the standard tool for it is the method of [Lagrange multipliers](https://en.wikipedia.org/wiki/Lagrange_multiplier#Summary_and_rationale). We encode the constraint $u^T u = 1$ into the objective:

$$
\mathcal{L}(u, \lambda) = u^T \Sigma u - \lambda (u^T u - 1)
$$

Taking the gradient with respect to $u$ and setting it to zero:

$$
\frac{\partial \mathcal{L}}{\partial u} = 2\Sigma u - 2\lambda u = 0 \implies \Sigma u = \lambda u
$$

And there it is - **the direction that maximizes variance is an eigenvector of the covariance matrix**, and the variance along it is the corresponding eigenvalue:

$$
u_1^T \Sigma u_1 = u_1^T (\lambda_1 u_1) = \lambda_1
$$

Since $\Sigma$ is symmetric (property 1 from before), the spectral theorem guarantees it has $n$ real, orthogonal eigenvectors $u_1, \dots, u_n$ with real eigenvalues $\lambda_1 \geq \lambda_2 \geq \dots \geq \lambda_n \geq 0$. If we sort them by eigenvalue, the first eigenvector $u_1$ is our answer: it is the direction of maximum variance, i.e. the **first principal component**.

### Extending to $k$ dimensions

The single-direction result generalizes beautifully: instead of one direction, we want the best $k$-dimensional subspace to project onto. The intuition is that we simply repeat the same game - find the direction of maximum variance, then find the next best direction that is **orthogonal** to the first (so it captures variance the first one missed, rather than re-explaining it), and so on $k$ times. Because each new direction must be orthogonal to the previous ones, the variances they capture simply add up, and the optimal subspace turns out to be the one spanned by the top-$k$ eigenvectors $u_1, \dots, u_k$, capturing $\sum_{j=1}^{k} \lambda_j$ of the total $tr(\Sigma) = \sum_{j=1}^{n} \lambda_j$ variance.

This gives us a principled way to choose $k$: pick the smallest $k$ such that the **explained variance ratio** $\sum_{j=1}^{k} \lambda_j / \sum_{j=1}^{n} \lambda_j$ is large enough (say, 95%).

<details>
    <summary>Full derivation for the k-dimensional case</summary>

    Let $U \in \R^{n \times k}$ be a matrix whose columns are orthonormal vectors, $U^T U = I$. Projecting $Z^{(i)}$ onto this subspace gives $U^T Z^{(i)}$, and the variance captured is:

    $$
    \frac{1}{n} \sum_{i=1}^{n} ||U^T Z^{(i)}||^2 = \frac{1}{n} \sum_{i=1}^{n} (Z^{(i)})^T U U^T Z^{(i)} = tr(U^T \Sigma U)
    $$

    Maximizing $tr(U^T \Sigma U)$ subject to $U^T U = I$ gives, by the same Lagrangian argument applied column by column, that the columns of $U$ must be eigenvectors of $\Sigma$. So the optimal $k$-dimensional subspace is spanned by the top-$k$ eigenvectors $u_1, \dots, u_k$, and the variance it captures is:

    $$
    \sum_{j=1}^{k} \lambda_j
    $$

    out of the total $tr(\Sigma) = \sum_{j=1}^{n} \lambda_j$.
</details>

### Running PCA ourselves

To back these observations with numbers, I ran the full PCA pipeline from the [logistic regression](/blog/aimlj-5-logistic-regression) blog post on the same data - center, SVD, sort eigenvalues - and looked at what the components actually capture.

First, the explained variance. The scree plot shows how much variance each component carries individually (left) and cumulatively (right):

<iframe src="/notebooks/plots/pca_explained_variance.html" width="100%" height="450px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

The numbers behind the plot:

| Components kept | Variance captured |
|---|---|
| 1 | 43.9% |
| 2 | 62.9% |
| 3 | 72.5% |
| 5 | 84.7% |
| 7 | 90.9% |
| 10 | 95.1% |

Two lessons here. First, the variance drops off *fast* - the first component alone carries more than the next five combined, which is the correlated-features story from above made quantitative. Second, and just as important: reaching the 95% threshold takes **10 components, not 2**. This is the honest caveat in numbers - the top-2 view is a *visualization* tool, not a full compression. It shows us the structure of the data, but a third of the variance still lives in the discarded directions.

Next, the projection itself - the same top-2 view as the decision boundary plot, but showing the data alone:

<iframe src="/notebooks/plots/pca_projection_2d.html" width="100%" height="500px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

Finally, the loadings - which original features drive each component. Each principal component is a linear combination of all 30 features, and the eigenvector entries tell us the weights:

<iframe src="/notebooks/plots/pca_loadings.html" width="100%" height="450px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

PC 1 is dominated by the size/shape cluster - `concave points`, `concavity`, `compactness`, `perimeter`, `radius`, `area` - which is exactly the set of mutually correlated features we flagged earlier. PC 2 picks up a genuinely different direction: `fractal_dimension` and `smoothness`, features that measure texture rather than size. This is orthogonality in action - the second component cannot re-explain what the first already captured, so it is forced to find independent structure.

### Putting it all together, PCA is:

1. Useful for dimensionality reduction, visualization, and understanding the structure of high-dimensional data.
2. A linear transformation that finds uncorrelated directions of maximum variance.
3. Implemented via centering, covariance computation, and eigendecomposition.
4. Has principled derivation from linear algebra and optimization, with the top-$k$ eigenvectors forming the optimal subspace.

To checkout the full notebook with code and plots, you can find it [here](https://github.com/manavdahra/manavdahra.github.io/blob/main/notebooks/pca.ipynb).

I hope this post gives you a good understanding of PCA and its connection to linear algebra. In the next post, I will discuss another important topic in machine learning - Bias-Variance tradeoff and how it affects model performance. Stay tuned!

