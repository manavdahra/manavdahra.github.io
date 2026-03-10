# Transformer Circuits: Understanding Attention Mechanisms

After replicating several papers from Anthropic's interpretability team and working through the ARENA curriculum, I've developed a deeper appreciation for how transformers actually work. Let me walk you through understanding attention mechanisms from a circuits perspective.

## What Are Transformer Circuits?

Think of a neural network like a circuit board. Individual components (attention heads, MLP layers, neurons) are connected in complex ways to perform specific computations. A **circuit** is a subgraph of the network that implements a coherent algorithm.

The circuits framework asks: **What is the algorithm that this part of the network learned?** Not just "what does it activate on?" but "what computation does it perform?"

## Attention: The Core Mechanism

Attention is how transformers route information between positions. Let me break down what's **actually** happening mathematically and algorithmically.

### The Math

For a sequence of tokens with embeddings $X \in \mathbb{R}^{n \times d}$:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

Where:
- $Q = XW_Q$ (queries) - "what am I looking for?"
- $K = XW_K$ (keys) - "what do I contain?"
- $V = XW_V$ (values) - "what information do I send?"

### The Intuition

Each token asks a question (query) and every other token offers information (key-value pairs). Attention weights determine how much to "listen" to each token.

But that's the textbook version. Let's dig deeper.

## Types of Attention Heads

Through mechanistic interpretability research, we've discovered that attention heads learn **specific algorithms**:

### 1. Previous Token Heads

The simplest pattern: always attend to the previous token.

```python
import torch
from transformer_lens import HookedTransformer

model = HookedTransformer.from_pretrained("gpt2-small")

# Test prompt
prompt = "The cat sat on the mat and"
logits, cache = model.run_with_cache(prompt)

# Check attention pattern for layer 0, head 0
attention = cache["pattern", 0][0, 0]  # [query_pos, key_pos]

# Previous token heads show strong diagonal (offset by -1)
print("Attention pattern diagonal scores:")
for offset in range(-3, 1):
    score = attention.diagonal(offset).mean().item()
    print(f"Offset {offset}: {score:.3f}")
```

**Why does this matter?** Previous token heads enable simple bigram statistics - the model learns "what typically comes after this token?"

### 2. Induction Heads

One of the most important discoveries in transformer circuits. Induction heads enable **in-context learning**.

**The Pattern:** [A][B] ... [A] → predict [B]

```python
# Classic induction test
test_prompts = [
    "The cat sat on the mat. The cat",  # Should predict " sat"
    "Alice went to the store. Alice",    # Should predict " went"
    "print hello world\nprint hello",     # Should predict " world"
]

def find_induction_heads(model, prompts):
    """Find heads that implement induction"""
    for layer in range(model.cfg.n_layers):
        for head in range(model.cfg.n_heads):
            scores = []
            
            for prompt in prompts:
                logits, cache = model.run_with_cache(prompt)
                pattern = cache["pattern", layer][0, head]
                
                # Induction heads attend to tokens after previous copies
                # Check if pattern shows this structure
                # ... implementation details ...
                
            if is_induction_head(scores):
                print(f"Induction head: Layer {layer}, Head {head}")

find_induction_heads(model, test_prompts)
```

**Discovery:** Induction heads emerge around layer 3-4 in GPT-2 Small. This is when the model suddenly gets much better at in-context learning.

### 3. Composition: K-Composition and V-Composition

Attention heads **compose** - the output of one head becomes input to another.

**K-Composition:** Earlier head determines where later head attends

```python
# Layer 0 head identifies "the noun"
# Layer 1 head attends to "the noun" to incorporate its information
```

**V-Composition:** Earlier head computes features, later head moves them

```python
# Layer 0 head: "is this word capitalized?"
# Layer 1 head: attends to first token, accumulates "capitalization" info
```

This is how transformers build hierarchical abstractions!

## Deep Dive: The Induction Circuit

Let me walk through the full induction circuit - it's a beautiful example of algorithmic discovery.

### Components

1. **Previous Token Head** (often Layer 0)
   - Stores "what came after each token last time"
   
2. **Induction Head** (often Layer 4-5)
   - Attends to the position stored by previous token head
   - Copies the value from that position

### The Algorithm in Detail

For prompt: "The cat sat on the mat. The cat"

**Step 1:** Previous token head processes first "cat"
- Sees: "The **cat** sat"
- Stores in position[cat]: "next token is 'sat'"

**Step 2:** Induction head processes second "cat"
- Query from "cat" position
- Uses K-composition to find previous "cat"
- Attends to token after previous "cat" (which is "sat")
- Copies "sat" representation

**Result:** Model predicts "sat"!

### Implementation

```python
def analyze_induction_circuit(model, prompt):
    """Analyze how induction circuit processes this prompt"""
    
    logits, cache = model.run_with_cache(prompt)
    tokens = model.to_str_tokens(prompt)
    
    # Find repeated token
    repeated_pos = -1  # Position of second occurrence
    repeated_token = tokens[repeated_pos]
    first_pos = tokens.index(repeated_token)
    
    # Analyze previous token head (assume layer 0, head 5)
    prev_head_pattern = cache["pattern", 0][0, 5]
    print(f"Previous token head attention from '{repeated_token}':")
    print(f"  Attends to previous position: {prev_head_pattern[repeated_pos, repeated_pos-1]:.3f}")
    
    # Analyze induction head (assume layer 4, head 3)
    induction_pattern = cache["pattern", 4][0, 3]
    print(f"\nInduction head attention from '{repeated_token}':")
    print(f"  Attends to first '{repeated_token}': {induction_pattern[repeated_pos, first_pos]:.3f}")
    print(f"  Attends after first '{repeated_token}': {induction_pattern[repeated_pos, first_pos+1]:.3f}")
    
    # What does it predict?
    predicted_token_id = logits[0, repeated_pos].argmax()
    predicted_token = model.to_string(predicted_token_id)
    actual_next = tokens[first_pos + 1]
    
    print(f"\nPrediction: '{predicted_token}'")
    print(f"Expected (from pattern): '{actual_next}'")
    print(f"Match: {predicted_token == actual_next}")

analyze_induction_circuit(model, "The cat sat on the mat. The cat")
```

## Attention Head Composition Circuits

The real power comes from composition. Let me show you a more complex circuit.

### The IOI Circuit (Indirect Object Identification)

For sentences like: "When John and Mary went to the store, John gave a drink to"

The model should predict "Mary" (the indirect object).

**Circuit components:**
1. **Name Mover Heads:** Move name information to final position
2. **Negative Name Mover Heads:** Suppress the subject name (John)
3. **S-Inhibition Heads:** Identify subject vs. indirect object
4. **Duplicate Token Heads:** Identify repeated names

```python
def analyze_ioi_circuit(model):
    """Analyze Indirect Object Identification circuit"""
    
    prompt = "When John and Mary went to the store, John gave a drink to"
    logits, cache = model.run_with_cache(prompt)
    
    # Identify key positions
    io_pos = 3   # "Mary" (indirect object)
    s_pos = 9    # "John" (subject)
    end_pos = -1 # Final position
    
    # Check Name Mover Heads (move Mary's info to end)
    for layer in [9, 10]:  # Typical NMH layers
        for head in range(model.cfg.n_heads):
            pattern = cache["pattern", layer][0, head]
            io_attn = pattern[end_pos, io_pos].item()
            
            if io_attn > 0.5:
                print(f"Name Mover Head: Layer {layer}, Head {head}")
                print(f"  Attention to IO (Mary): {io_attn:.3f}")
    
    # Check Negative Name Mover Heads (suppress John)
    # ... implementation details ...
    
    # Verify prediction
    predicted = model.to_string(logits[0, end_pos].argmax())
    print(f"\nPredicted: {predicted}")  # Should be "Mary"

analyze_ioi_circuit(model)
```

## Attention as Computation

Let me share a key insight: **Attention is not just "which tokens are relevant." It's a programming primitive.**

### Attention Implements:

1. **Routing:** Move information from position A to position B
2. **Lookup:** Find the token with property X
3. **Aggregation:** Combine information from multiple positions
4. **Filtering:** Select based on keys, extract via values

This is why transformers are so powerful - they learn to write their own routing logic!

## Practical Techniques for Analysis

### 1. Activation Patching

The gold standard for proving causality:

```python
def patch_head(model, clean_prompt, corrupt_prompt, layer, head):
    """
    Run model on corrupted input, but patch in clean activation
    for one specific head. Measure impact on output.
    """
    
    # Get clean activation
    _, clean_cache = model.run_with_cache(clean_prompt)
    clean_head_out = clean_cache["result", layer][:, :, head]
    
    # Patch into corrupted run
    def hook_fn(activation, hook):
        activation[:, :, head] = clean_head_out
        return activation
    
    patched_logits = model.run_with_hooks(
        corrupt_prompt,
        fwd_hooks=[(f"blocks.{layer}.attn.hook_result", hook_fn)]
    )
    
    return patched_logits

# If patching restores correct behavior, that head is important!
```

### 2. Attention Pattern Visualization

```python
import circuitsvis as cv

def visualize_attention(model, prompt, layer, head):
    """Interactive attention visualization"""
    
    logits, cache = model.run_with_cache(prompt)
    tokens = model.to_str_tokens(prompt)
    pattern = cache["pattern", layer][0, head]
    
    cv.attention.attention_patterns(
        tokens=tokens,
        attention=pattern.unsqueeze(0),  # Add head dimension
        attention_head_names=[f"L{layer}H{head}"]
    )

visualize_attention(model, "The cat sat on the mat", layer=0, head=5)
```

### 3. Logit Lens

See what the model "thinks" at each layer:

```python
def logit_lens(model, prompt):
    """Show predicted tokens at each layer"""
    
    logits, cache = model.run_with_cache(prompt)
    
    for layer in range(model.cfg.n_layers):
        # Get residual stream at this layer
        resid = cache["resid_post", layer][0, -1]  # Last position
        
        # Project to vocabulary
        layer_logits = model.unembed(model.ln_final(resid))
        predicted = model.to_string(layer_logits.argmax())
        
        print(f"Layer {layer}: {predicted}")

logit_lens(model, "The capital of France is")
```

## Current Research Questions

### 1. Universality

Do different models learn the same circuits? Evidence suggests yes - induction heads appear reliably around layer ⅓ of most transformers.

### 2. Superposition in Attention

Can attention heads implement multiple algorithms simultaneously? Preliminary evidence says yes, via superposition.

### 3. Attention Head Diversity

Why does GPT-2 have 12 heads per layer? Would 1 large head work? 100 small heads? 

Hypothesis: Different heads specialize in different composition types.

## Conclusion

Attention is the fundamental building block of transformers, but it's more sophisticated than "selective focus." Attention heads implement **learned algorithms** that compose to build complex behaviors.

By studying circuits, we can:
- Understand what models actually do
- Predict when they'll fail
- Design better architectures
- Ensure AI safety

The field is young, and there's so much left to discover. Every paper I replicate raises more questions than it answers. But that's what makes it exciting!

---

**Key Papers:**
- [A Mathematical Framework for Transformer Circuits](https://transformer-circuits.pub/2021/framework/index.html)
- [In-context Learning and Induction Heads](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html)
- [Interpretability in the Wild](https://transformer-circuits.pub/2023/interpretability-in-the-wild/index.html)

Want to discuss attention mechanisms or circuits? I'm always up for a deep technical conversation!
