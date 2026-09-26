# Debugging model training

1. Loss curve is not converging

- Check if input data normalised
- Canonical ordering of loss.backward(), optim.zero_grad() and optim.step(). What should be the right order and why ?
- Parameter initialisation and how it can make the network dead

