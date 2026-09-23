## Logistic regression

Previously, I talked about [Linear regression](/blog/aimlj-4-linear-regression) where I showed how to build a model that predicts real valued continuous outputs in co-domain $R$. For instance, you may have a model that predicts housing prices which are a function of many features like - house size, number of bedrooms, neighbourhood, build quality etc. And even though the name of the methodology says "linear regression", don't be misled by the terminology, it is not restricted to linear functions. Do check out the post if you are not sure about this claim. In this post I will discuss logistic regression in depth. 

Imagine, that instead of predicting housing prices, you'd like to do a categorisation task. Lets take an example, given we have [breast-cancer](https://huggingface.co/datasets/mnemoraorg/wisconsin-breast-cancer-diagnostic) dataset, we would like to build a predictive model that can classify if a patient has `malignant` or `benign` tumor or not. The input provided to us is in the tabular format which has `float64` columns and we want to output a label "M" (malignant) or "B" (benign) based on this input. 

Formally, we can say that:

$X \in \R^n$ and $y \in [0, 1]$ where, $0$ means benign and $1$ means malignant.

### Why not use linear regression?

A natural first thought is to reuse linear regression: fit $z = \theta^T x$ and threshold at some cutoff, say $0.5$. This works poorly for classification for two reasons. 

- First, the squared-error loss of linear regression punishes *confident correct* predictions - a data point with $y = 1$ and predicted value $5$ incurs a large penalty even though the classification is correct. 
- Second, the output is unbounded, so extreme feature values dominate the fit and the resulting decision boundary is sensitive to outliers. What we want instead is a model whose output is a *probability* - bounded between $0$ and $1$.

We can see both failure modes in one picture. Below is a toy 1-D dataset (tumor size vs malignant/benign) with a single far-away outlier at $x = 20$. The straight line is the ordinary least squares fit; the S-curve is logistic regression trained on the same data:

<iframe src="/notebooks/plots/logistic_regression_vs_linear.html" width="100%" height="500px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

Two things to notice:

- The **OLS line escapes $[0, 1]$** - for tumor sizes below $-1$ it predicts negative probabilities, and beyond $13.3$ it predicts values greater than $1$. Neither can be interpreted as a probability.
- The **outlier at $x = 20$ drags the OLS line upward**, shifting its $0.5$-threshold to $x = 6.17$, even though the ten "normal" points suggest the boundary should sit near $5.5$. The logistic fit is barely bothered - its decision boundary lands at $x = 5.45$, right where the data actually changes class. Squared error punishes the outlier's large vertical distance, while the log-loss of logistic regression only cares about *which side* of the boundary the point falls on.


## The logistic regression model

Logistic regression keeps the linear part and squashes it through the sigmoid function:

$$
h_{\theta}(z) = \frac{1}{1 + \exp(-z)}
$$

where the linear part $z$ is given by

$$
z = \theta^T x \qquad \text{where, } x \in \R^n
$$

The sigmoid maps any real number into $(0, 1)$, so $h_{\theta}(x)$ can be interpreted as $p(y = 1 | x; \theta)$ - the probability that the tumor is malignant given the features.

A property of the sigmoid that we will need later is its derivative. 

Differentiating:

$$
\frac{\partial h_{\theta}}{\partial z} = \frac{\exp(-z)}{(1+\exp(-z))^2} = h_{\theta} (1 - h_{\theta})
$$

And by the chain rule, the derivative with respect to the parameters is:

$$
\boxed{\frac{\partial h_{\theta}}{\partial \theta} = h_{\theta} (1 - h_{\theta}) x}
$$

> Notice how clean this is - the derivative of the sigmoid is expressible in terms of the sigmoid itself.

A plot makes both the function and this property tangible. Notice in the lower panel how the derivative peaks at exactly $0.25$ where $z = 0$ (the sigmoid is steepest at its midpoint) and flattens to zero at both tails - this is the vanishing-gradient behaviour that feature normalization protects us from:

<iframe src="/notebooks/plots/sigmoid_and_its_derivative.html" width="100%" height="500px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

## Maximum likelihood estimation connection

> Where does the training objective come from? You ask

We can derive it from first principles. If we think of the tumor diagnosis as a random variable $y$ distributed over a population of patients, then the probability distribution can be given as:

$$
p(y|x;\theta) = \begin{cases}
 h_{\theta}(x) & \text{if } y = 1\\
 1 - h_{\theta}(x) & \text{if } y = 0
 \end{cases}
$$

This is the [Bernoulli distribution](https://en.wikipedia.org/wiki/Bernoulli_distribution), written concisely as:

$$
p(y_i | x_i; \theta) = h_{\theta}(x_i)^{y_i} (1 - h_{\theta}(x_i))^{1-y_i}
$$

For our dataset of $N$ patients, assuming the examples are i.i.d., the likelihood of observing all the labels is:

$$
L(\theta) = \prod_{i=1}^N p(y_i | x_i; \theta) = \prod_{i=1}^N h_{\theta}(x_i)^{y_i} (1 - h_{\theta}(x_i))^{1-y_i}
$$

Taking $\log$ on both sides (which preserves the location of the maximum, since log is monotonic):

$$
\log L(\theta) = \sum_{i=1}^N y_i \log h_{\theta}(x_i) + (1 - y_i) \log (1 - h_{\theta}(x_i))
$$

For brevity, let $h_i = h_{\theta}(x_i)$. 

Now, like in the earlier posts, we will Maximise the Likelihood by differentiating both sides with respect to $\theta_j$ and setting to $0$:

$$
\frac{\partial}{\partial \theta_j} \log L(\theta) = \sum_{i=1}^N \left(\frac{y_i}{h_i} - \frac{1 - y_i}{1 - h_i}\right) \left(h_i \left(1 - h_i\right) x_{ij}\right) = \sum_{i=1}^N \left(y_i - h_i\right) x_{ij}
$$

$$
\boxed{\frac{\partial}{\partial \theta} \log L(\theta) = \sum_{i=1}^N \left(y_i - h_{\theta}(x_i)\right) x_i}
$$

Every term in the sum contributes to the derivative with respect to $\theta_j$ through the $j$-th feature $x_{ij}$ of each example, which is why the sum stays intact. 

> The result has a beautiful interpretation: the gradient is a sum of *error residuals* $(y_i - h_i)$ weighted by the features.

### Connection with binary cross entropy loss

Whats remarkable about this result is that the practice of using [BCELoss](https://docs.pytorch.org/docs/2.14/generated/torch.nn.BCELoss.html) also matches it

$$
\text{BCE}(\theta) = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log h_{\theta}(x_i) + (1 - y_i) \log (1 - h_{\theta}(x_i)) \right] = -\frac{1}{N} \log L(\theta)
$$

So BCE is simply the negative average log-likelihood, and its gradient is:

$$
\nabla_{\theta} \text{BCE}(\theta) = -\frac{1}{N} \sum_{i=1}^N \left(y_i - h_{\theta}(x_i)\right) x_i
$$

Therefore, minimizing BCE loss is exactly the same as maximizing the log-likelihood. When `loss.backward()` runs in the training loop, it performs gradient *descent* on BCE, which is gradient *ascent* on $\log L(\theta)$.

## Pre-processing the dataset

Now, lets come back to our breast cancer classification problem. Before we even build the model and run a training loop, we need to first pre-process our dataset. Models are only as good as the data on which they are trained. If you feed them garbage data, what you'll get back is grabage.

Not only that, it is very important to be careful of what you feed to the model so it doesn't leak any information about its labels/outputs. 

More concretely put, our [dataset](https://huggingface.co/datasets/mnemoraorg/wisconsin-breast-cancer-diagnostic) has a few columns that leak information or are not useful: `id` (a unique identifier), `diagnosis` (the label itself) and an unnamed empty column. We need to drop such columns, map the labels `M`/`B` to `1`/`0`, and split into train and test sets.

> Why drop `id` column you may ask ?

<details>
    <summary>Click here to expand</summary>
    If `id` column is not dropped then the model will memorize the outputs on that column instead of recognising any meaningful patterns in the data.

    Models look for the most optimal way to get answers and will always follow the path of least resistance. If memorisation helps, then that is what a model will do.
</details>

Another step that matters a lot in practice is **feature normalization**. The features in this dataset live at wildly different scales - `area` is in the hundreds to thousands while `smoothness` is around $0.1$. If we feed these raw values into $z = \theta^T x$, the logits explode, the sigmoid saturates at exactly $0$ or $1$, and gradients vanish. The fix is z-score standardization:

$$
x' = \frac{x - \mu}{\sigma}
$$

A subtle but important detail: the mean $\mu$ and standard deviation $\sigma$ are computed on the **train split only**, then applied to both train and test. Computing statistics on the test set would leak information about it into training.

## The model in PyTorch

```python
class LogisticRegression(Module):

    def __init__(self, size):
        super().__init__()
        self.W = nn.Parameter(t.randn(size=size))
        self.b = nn.Parameter(t.randn(size=(1,)))

    def forward(self, x: t.Tensor) -> t.Tensor:
        z = x @ self.W + self.b
        return nn.functional.sigmoid(z)
```

This is a direct translation of $h_{\theta}(x) = \sigma(\theta^T x)$ - a weight vector $W$, a bias $b$, and a sigmoid on the logits.

## Training loop

The training loop follows the same skeleton as linear regression: for each batch, compute predictions, compute the loss, backpropagate, and let the optimizer take a step. The two things that change are the loss function (BCE instead of MSE) and the metric (accuracy instead of $R^2$ - $R^2$ is a regression metric and behaves badly for classification).

```python
def train(model: nn.Module, ds: Dataset, epochs=100, lr=1e-3, eps=1e-5):
    X_train = DataLoader(ds["train"].with_transform(to_features), batch_size=16, shuffle=True)
    X_val = DataLoader(ds["test"].with_transform(to_features), batch_size=16)
    opt = AdamW(model.parameters(), lr=lr, eps=eps)

    losses, scores = [], []
    for epoch in range(epochs):
        batch_losses = []
        for batch in X_train:
            target = batch["y"]
            predicted = model(batch["x"])
            loss = nn.functional.binary_cross_entropy(predicted, target.view(-1, 1))
            opt.zero_grad()
            loss.backward()
            opt.step()
            batch_losses.append(loss.item())

        losses.append(sum(batch_losses)/len(batch_losses))

        # Evaluate accuracy on the whole validation set
        correct, total = 0, 0
        with t.no_grad():
            for batch in X_val:
                predicted = (model(batch["x"]) >= 0.5).float()
                correct += (predicted == batch["y"].view(-1, 1)).sum().item()
                total += len(batch["y"])
        scores.append(correct / total)
```

A few points worth noting:

- **Accuracy** is computed by thresholding the predicted probability at $0.5$ and counting matches against the labels, over the *whole* validation set rather than averaging per-batch accuracies (which would misweight the last, smaller batch).
- **`t.no_grad()`** wraps the evaluation pass since we don't need gradients there.
- The gradient step order is `zero_grad()` → `backward()` → `step()`, so each batch's gradients don't accumulate into the next.

## Results

Training for 1000 epochs with AdamW (`lr=1e-4`), the loss falls from about $5.5$ to $0.05$ and the validation accuracy climbs from coin-flip to **98.2%**:

```
Epoch: 100  Loss: 1.905  Accuracy: 0.246
Epoch: 200  Loss: 0.523  Accuracy: 0.737
Epoch: 300  Loss: 0.227  Accuracy: 0.947
Epoch: 400  Loss: 0.133  Accuracy: 0.965
Epoch: 500  Loss: 0.095  Accuracy: 0.965
Epoch: 600  Loss: 0.076  Accuracy: 0.982
...
Epoch: 1000 Loss: 0.054  Accuracy: 0.982
```

The loss curve shows smooth, monotone-ish descent and the accuracy curve plateaus once the model has found the best separating hyperplane it can.

<iframe src="/notebooks/plots/logistic_regression_loss_curves.html" width="100%" height="500px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

## The decision boundary

Because the model is linear, its decision boundary - the set of points where $h_{\theta}(x) = 0.5$, equivalently $\theta^T x + b = 0$ - is a hyperplane in the $n$-dimensional feature space. With $30$ features we cannot draw it directly, but the fact that it *is* a hyperplane is exactly what makes logistic regression interpretable: each weight $\theta_j$ tells us how the log-odds of malignancy change when feature $j$ increases by one unit (holding others fixed).

To *see* the boundary, we can project the data onto its top-2 principal components. Since the model is linear, its boundary remains a straight line in this view - the contour below shows the model's predicted probability across the plane, with the transition band marking $p = 0.5$:

<iframe src="/notebooks/plots/logistic_regression_decision_boundary_2d.html" width="100%" height="500px" frameborder="0" style="border: none; border-radius: 8px; overflow: hidden;" scrolling="no"></iframe>

We can also plot decision boundary in 3-D but I'll leave that for the readers to explore. If you are really curious and want to explore, please find the link to the notebook at the end of this post.

One caveat on interpretation: many features in this dataset are derived from one another (`area` is roughly `radius`$^2$, `compactness` is `perimeter`$^2$/`area` $- 1$), so the weights on collinear features can trade off against each other without changing predictions. The *predictions* are unaffected, but individual coefficients should be interpreted with care.

This also means that we can have far less complex model (i.e. with lesser number of weight parameters) which can reduce any amount of overfitting we have. This relates to a very important concent in ML which is called Bias-Variance tradeoff which I will discuss in later posts. 

## Summary

- Logistic regression = linear model + sigmoid, producing a probability instead of an unbounded value.
- The sigmoid's derivative $h(1-h)$ makes the MLE gradient collapse to the clean residual form $\sum_i (y_i - h_i) x_i$.
- BCE loss is exactly the negative log-likelihood, so minimizing it *is* maximum likelihood estimation.
- Normalizing features (with statistics from the train split only) is essential - without it the sigmoid saturates and learning stalls.
- On the breast cancer dataset, this simple model reaches ~98% validation accuracy.

The full notebook with code, loss curves and plots is available [here](https://github.com/manavdahra/manavdahra.github.io/blob/main/notebooks/logistic_regression.ipynb). 

