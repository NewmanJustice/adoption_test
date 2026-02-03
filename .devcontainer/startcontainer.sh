docker run --privileged -it --rm \
  -v "$HOME/.bash_history:/home/vscode/.bash_history" \
  -v "$HOME/.zsh_history:/home/vscode/.zsh_history" \
  -v "$HOME/.azure:/home/vscode/.azure" \
  -v "$HOME/.kube:/home/vscode/.kube" \
  -v "$(pwd):/workspaces/$(basename $(pwd))" \
  -w /workspaces/$(basename $(pwd)) \
  mcr.microsoft.com/devcontainers/base:ubuntu