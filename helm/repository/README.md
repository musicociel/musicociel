# <img src="https://raw.githubusercontent.com/musicociel/musicociel/main/src/ui/public/favicon.svg" width="32"> Musicociel Helm Repository

This repository contains a [Helm](https://helm.sh/) chart to help installing [Musicociel](https://github.com/musicociel/musicociel#readme) on a [Kubernetes](https://kubernetes.io/) cluster.

**Note that this application is still at an early stage of development and many features are either missing or not working as expected.**

To install Musicociel with Helm on your Kubernetes cluster, use the following commands:

```
helm repo add musicociel https://musicociel.github.io/musicociel/helm
helm repo update
helm install my-release musicociel/musicociel
```
