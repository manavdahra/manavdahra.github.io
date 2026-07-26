### Recap

In previous post, I introduced the concept of Maximum Likelihood estimation. Under this concept, we consider our observations $\{(x_i, y_i)\}_{i=1}^N$ as a sample drawn from some underlying distribution $\mathcal{D}$. We also assume that $y$ is a dependent variable on $x$ under some hypothesis function $h_{\theta}(x)$ where $\theta$ are model parameters, and we try to maximise the conditional probability $p(y | x; \theta)$ 
of observing $y$ when $x$ is given to us.

Formally, the likelihood function is given by:
\begin{align*}
    \mathcal{L}(\theta) = p(y_1, y_2, ..., y_N | x_1, x_2, ..., x_N)
\end{align*}

I also showed that in maximising the above function after taking the $\log$ on both sides, we end up with loss function in a principled way.

To recap, following result was achieved:

\begin{align*}
    \hat{\theta} &= \arg\max_\theta \, \sum_{i=1}^{N} \log p(y_i \mid x_i;\theta)\\
    &= \arg\max_\theta \, \ell(\theta)
\end{align*}

the log-likelihood term $\ell(\theta) = \log p(y_i \mid x_i;\theta)$ is our loss function that maps $\ell: \theta \to \R$ (a real valued quantity).

### How do we find $\arg\max_{\theta}$ ?

We take gradient of $\ell(\theta)$ wrt to $\theta$ and set it to 0. 
i.e 
\begin{align*}
    \nabla_{\theta} \arg\max_\theta \, \ell(\theta) = 0
\end{align*}

Solving this gives us a closed form solution and we arrive at the optimal parameters $\hat{\theta}$. But as I will show in subsequent posts, it is **not** possible to find a closed form solution of this equation in all the cases.

> What now ? does this mean we can't build a good prediction model in such cases ? 

We still can! at least an approximately good one.

> How ? 

Well, what what do we need to find here ? 

$\hat{\theta}$ (the parameters that maximise the probability of observing data distribution) where $\hat{\theta} \in \R^d$ where $d$ is the model dimensions. 
To find the approximate solution that sits near the $\hat{\theta}$, we can start at some random point $\theta_t$, compute the gradient at that point and do hill climbinging in the direction of the gradient iteratively, we can traverse this path to reach the top of the hill that hopefully takes us very close to exact solution.

> Hill climbing ? How do we even implement this ?

At each step, we need to find the direction of gradient and move towards it. 

So, what is the gradient at step $t$ for parameter $\theta$ ? 

$\nabla_{\theta_t} \ell(\theta_t)$

We need to update our current position vector $\theta_t$ by adding this scaled step in this direction to move towards our solution. This gives us following update rule:
\begin{align*}
    \theta_{t+1} := \theta_{t} + \alpha \nabla_{\theta_t} \ell(\theta_t)
\end{align*}

where $\alpha$ is some scalar that scales the direction in which we want to move. Taking small steps in the direction of gradient is a better strategy to reach the target point even though it might take many iterations, hence the need for this hyper-parameter.

> Wasn't this post about Gradient Descent ? Hill climbing means we are ascending, not descending.

Indeed, the term $\nabla_{\theta_t} \ell(\theta_t)$ is positive valued which makes it ascent not descent. But when you plug in actual values of $\ell(\theta_t)$ for your data distribution this term turns into a descent term with $-\arg\min$ operator and this is very common in practice, hence we generally say Gradient **descent** and not ascent. I'll show a concrete example of this in the next post on Linear regression.

> Ok, that's convincing, but how do we know we are "close" to the exact solution ? When do we stop the iterations ?

"closeness" is up to us to decide. We decide what is the convergence criteria which could be based on the fact that parameters/gradients have stopped changing, or max number of iterations have been achieved and the tolerance level of convergence is one of the hyperparameters we get to tune.

As an example, one way to define convergence is to compute the absolute difference of parameters between subsequent timesteps falling below certain threshold $\epsilon$:
\begin{align*}
    |\theta_{t+1} - \theta_t| < \epsilon
\end{align*}

### The algorithm

If you were able to follow along and are convinced so far, then we get following psuedo-algorithm:

\begin{align*}
    \text{while } &|\theta_{t+1} - \theta_t| >= \epsilon:\\
        & \text{sample $\mathcal{B}$ } \text{from } \mathcal{T}\\
        & \text{for entry $(x_i, y_i)$ } \text{in } \mathcal{B}:\\
        & \qquad \theta_{t+1} := \theta_{t} + \alpha \nabla_{\theta_t} \ell(\theta_t | x_i, y_i)
\end{align*}

where, $\mathcal{B} = \{(x_i, y_i)\}_{i=1}^b$ is a batch of size $b$ drawn from training data distribution $\mathcal{T}$

| Batch size | Algorithm | Pros | Cons |
|------------|-----------|------|------|
| 1 | Stochastic Gradient Descent | <ul><li>Fast updates per iteration</li><li>Can escape local minima due to noise</li><li>Works with large datasets</li></ul> | <ul><li>Noisy gradients</li><li>Slower convergence</li><li>Hard to parallelize</li></ul> |
| $b$ (small) | Mini-batch Gradient Descent | <ul><li>Balance between speed and stability</li><li>Efficient GPU utilization</li><li>Smoother convergence than SGD</li></ul> | <ul><li>Requires tuning batch size</li><li>May still get stuck in local minima</li></ul> |
| $N$ (all data) | Batch Gradient Descent | <ul><li>Stable convergence</li><li>Exact gradient computation</li><li>Guaranteed convergence for convex functions</li></ul> | <ul><li>Very slow for large datasets</li><li>High memory requirements</li><li>May get stuck in local minima</li></ul> |

The interactive visualisation below shows the loss surface and the training trajectories of gradient descent with different batch sizes. You can rotate the 3D plot to see how SGD (bs=1) and large-batch GD (bs=64) trace different paths toward the minimum.

<iframe src="/notebooks/plots/gradient_descent.html" width="100%" height="700px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

As we can see SGD (bs=1) the path is more noisy and while the oath of large batch (bs=64) gradient descent is more smoother.
