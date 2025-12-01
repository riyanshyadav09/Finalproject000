# Kubernetes Deployment Guide

## Prerequisites
- Kubernetes cluster (v1.20+)
- kubectl configured
- NGINX Ingress Controller
- cert-manager (for SSL certificates)

## Deployment Steps

1. **Create namespace and secrets:**
```bash
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
```

2. **Deploy application:**
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

3. **Verify deployment:**
```bash
kubectl get pods -n streamflix
kubectl get services -n streamflix
kubectl get ingress -n streamflix
```

## Scaling
The HPA will automatically scale between 3-10 replicas based on CPU/Memory usage.

## Monitoring
```bash
kubectl logs -f deployment/streamflix-app -n streamflix
kubectl describe pod <pod-name> -n streamflix
```