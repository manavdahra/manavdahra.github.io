# Mechanistic Interpretability: A Practical Introduction

After spending months replicating papers from Anthropic's interpretability team and completing the ARENA curriculum, I've become convinced that mechanistic interpretability is one of the most important areas in AI safety. Let me share what I've learned and why it matters.

## What is Mechanistic Interpretability?

Mechanistic interpretability is the study of **reverse engineering neural networks** - understanding not just what models do, but **how they do it** at the level of neurons, attention heads, and circuits. It's like debugging a program, except the "program" wrote itself during training.

Traditional interpretability asks: "What features does this model use?"

Mechanistic interpretability asks: "What is the **algorithm** the model learned? How do its components work together?"

## Why Does This Matter?

As we deploy increasingly powerful AI systems, we need to:

1. **Detect deception**: Can we tell if a model is lying or pursuing hidden goals?
2. **Ensure alignment**: Does the model actually optimize for what we want?
3. **Predict failures**: Can we anticipate dangerous behaviors before deployment?
4. **Build trust**: Can we verify claims about model capabilities?

Black-box testing isn't enough. We need to look inside.

## The TransformerLens Toolkit

My go-to library for interpretability research is [TransformerLens](https://github.com/neelnanda-io/TransformerLens) by Neel Nanda. It's built on PyTorch and makes it easy to access model internals.

### Basic Setup

```python
import torch
from transformer_lens import HookedTransformer

# Load a model
model = HookedTransformer.from_pretrained("gpt2-small")

# Run a forward pass and cache activations
prompt = "The Eiffel Tower is in"
logits, cache = model.run_with_cache(prompt)

# Access any activation
attn_pattern = cache["pattern", 0]  # Layer 0 attention patterns
mlp_out = cache["mlp_out", 5]       # Layer 5 MLP outputs
```

The power here is the `cache` object - it stores every intermediate activation, making it trivial to analyze what's happening inside the model.

## Key Concepts

### 1. Attention Patterns

Attention heads learn to attend to relevant tokens. Visualizing these patterns reveals algorithmic structure.

```python
import circuitsvis as cv

# Visualize attention patterns
tokens = model.to_str_tokens(prompt)
attention_pattern = cache["pattern", 0]  # [batch, head, query_pos, key_pos]

# Interactive visualization
cv.attention.attention_patterns(
    tokens=tokens,
    attention=attention_pattern[0],  # First batch item
)
```

**Common attention head types:**
- **Previous token heads**: Attend to the token immediately before
- **Induction heads**: Enable in-context learning by copying patterns
- **Skip-trigram heads**: Look for specific patterns across multiple tokens

### 2. Logit Attribution

Which components contribute most to a prediction?

```python
# Decompose the logits by component
logit_attr = cache.accumulated_resid(layer=-1, return_labels=True)

# See which layers contribute to predicting "Paris"
paris_token_id = model.to_single_token(" Paris")
final_logit = logit_attr[:, -1, paris_token_id]  # Last position

# Print contribution by layer
for layer in range(model.cfg.n_layers):
    contribution = final_logit[layer].item()
    print(f"Layer {layer}: {contribution:.3f}")
```

### 3. Activation Patching (Causal Interventions)

The gold standard for proving causality: change an activation and measure the effect.

```python
def patch_attention_head(corrupted_cache, clean_cache, layer, head):
    """Replace corrupted activation with clean activation for one head"""
    def hook_fn(activation, hook):
        activation[:, :, head] = clean_cache[hook.name][:, :, head]
        return activation
    
    return (f"blocks.{layer}.attn.hook_result", hook_fn)

# Run model on corrupted input with patched activation
patched_logits = model.run_with_hooks(
    corrupted_prompt,
    fwd_hooks=[patch_attention_head(corrupted_cache, clean_cache, layer=4, head=7)]
)
```

This technique lets you ask: "Is attention head 4.7 causally important for this behavior?"

## A Real Example: Finding Induction Heads

Induction heads are crucial for in-context learning. They learn the pattern: when you see [A][B] ... [A], predict [B].

```python
# Test sequence with repeated pattern
test_prompt = "The cat sat on the mat. The cat"
# Model should predict " sat" by copying from earlier

def detect_induction_heads(model, prompt):
    logits, cache = model.run_with_cache(prompt)
    
    for layer in range(model.cfg.n_layers):
        for head in range(model.cfg.n_heads):
            pattern = cache["pattern", layer][0, head]  # [query_pos, key_pos]
            
            # Induction heads show diagonal + offset pattern
            # They attend to tokens that came after previous occurrences
            diagonal_score = pattern.diagonal(offset=-1).mean()
            
            if diagonal_score > 0.4:  # Threshold
                print(f"Induction head found: Layer {layer}, Head {head}")
                print(f"  Diagonal score: {diagonal_score:.3f}")

detect_induction_heads(model, test_prompt)
```

## Current Research Frontiers

### Superposition

Models store **more features than they have dimensions** by representing features in a sparse, overlapping way. This is both amazing (efficient!) and concerning (hard to interpret!).

Key paper: [Toy Models of Superposition](https://transformer-circuits.pub/2022/toy_model/index.html) (Anthropic)

### Circuits

Small, interpretable subgraphs of the network that perform specific computations. Like finding "functions" in the neural network.

Example circuits:
- **IOI Circuit** (Indirect Object Identification): "John gave Mary a gift, he gave her..."
- **Docstring Circuit**: Code completion based on docstrings
- **Greater-Than Circuit**: Comparing numbers

### Sparse Autoencoders (SAEs)

A new technique for finding interpretable features in superposition:

```python
# Train a sparse autoencoder on MLP activations
# Forces the model to represent activations as sparse combinations
# of learned dictionary features

autoencoder = SparseAutoencoder(
    input_dim=model.cfg.d_mlp,
    hidden_dim=model.cfg.d_mlp * 8,  # Overcomplete
    sparsity_coef=1e-3
)

# Each dictionary feature represents a human-interpretable concept
```

## Practical Tips from Research

### 1. Start Small

Don't jump straight to GPT-4. Use small models like `gpt2-small` or `GPT-2-medium`. They're:
- Faster to run
- Easier to visualize
- Still exhibit interesting behaviors

### 2. Ablation Everything

Remove components systematically:
- Zero out attention heads
- Knock out MLP layers
- Patch individual neurons

If the behavior persists, that component isn't critical.

### 3. Use Diverse Prompts

Test your hypotheses across multiple examples. A pattern you see on one prompt might be an artifact.

### 4. Visualize, Visualize, Visualize

Tools like `circuitsvis`, `plotly`, and `matplotlib` are essential. If you can't see it, you can't understand it.

## Challenges and Limitations

### Polysemanticity

Neurons often respond to **multiple unrelated concepts**. This makes interpretation harder - you can't just label a neuron as "the cat detector."

### Scale

Modern models have billions of parameters. Even with automation, comprehensive analysis is infeasible. We need better tools and abstractions.

### Verification

How do we know our interpretations are correct? We need rigorous causal testing, not just correlation.

## Getting Started

Here's my recommended learning path:

1. **ARENA Curriculum** - Comprehensive, hands-on exercises
2. **Neel Nanda's Walkthrough Videos** - Fantastic intuition-building
3. **Anthropic's Research** - State-of-the-art papers
4. **Replicate Papers** - Build intuition by reimplementing findings

## My Current Focus

I'm currently working on:
- Replicating the **IOI circuit** findings
- Exploring **sparse autoencoders** for feature extraction  
- Investigating **attention head composition** patterns
- Contributing to open-source interpretability tools

## Conclusion

Mechanistic interpretability is hard. Neural networks are complex, our tools are still primitive, and the field is young. But it's also incredibly important.

As AI systems become more powerful, we can't afford to treat them as black boxes. We need to understand what they're doing, how they're doing it, and whether we can trust them.

The good news? The field is growing fast, the tools are improving, and we're making real progress. If you care about AI safety, this is one of the most impactful areas to work on.

---

**Key Resources:**
- [TransformerLens](https://github.com/neelnanda-io/TransformerLens)
- [ARENA Curriculum](https://www.arena.education/)
- [Anthropic's Interpretability Research](https://transformer-circuits.pub/)
- [Neel Nanda's Blog](https://www.neelnanda.io/)

Want to discuss interpretability? Reach out - I'm always excited to talk about this stuff!
