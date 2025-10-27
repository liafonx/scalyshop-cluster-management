# ScalyShop Cluster Management - Infrastructure as Code

GitOps-based Kubernetes infrastructure management using Helmfile for declarative, version-controlled deployments.

## Tech Stack

![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28-326CE5?logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-3.13-0F1689?logo=helm&logoColor=white)
![Helmfile](https://img.shields.io/badge/Helmfile-0.157-000000)
![MongoDB](https://img.shields.io/badge/MongoDB-Sharded-47A248?logo=mongodb&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-Ingress-009639?logo=nginx&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?logo=grafana&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-GitOps-2088FF?logo=github-actions&logoColor=white)

**Additional Tools**: kubectl, Cert-Manager, Let's Encrypt

---

## Purpose

Manages complete Kubernetes cluster infrastructure using **Infrastructure-as-Code (IaC)** and **GitOps** principles:

- Declarative infrastructure configuration
- Version-controlled infrastructure changes
- Automated deployment pipelines
- Consistent, reproducible environments
- Infrastructure testing and validation

---

## Managed Components

### 1. NGINX Ingress Controller
**Location**: `applications/ingress/`  
L7 load balancing, HTTP/HTTPS routing, SSL/TLS termination

### 2. MongoDB Sharded Cluster
**Location**: `applications/mongodb-sharded/`  
Distributed database with horizontal scalability. Architecture includes config servers, shards, and mongos routers.

### 3. Prometheus
**Location**: `applications/prometheus/`  
Metrics collection and monitoring for pods, nodes, and applications

### 4. Grafana
**Location**: `applications/grafana/`  
Metrics visualization and dashboards for Kubernetes and application metrics

### 5. Cert-Manager (Optional)
**Location**: `applications/cert-manager/`  
Automated SSL/TLS certificate management with Let's Encrypt

---

## Repository Structure

```
scalyshop-cluster-management/
├── helmfile.yaml                  # Main orchestrator
├── applications/
│   ├── ingress/
│   │   ├── helmfile.yaml         # NGINX Ingress deployment
│   │   └── values.yaml
│   ├── mongodb-sharded/
│   │   ├── helmfile.yaml         # MongoDB cluster
│   │   ├── values.yaml
│   │   └── mongodb-init/         # Sharding initialization
│   │       ├── Chart.yaml
│   │       └── templates/
│   ├── prometheus/
│   │   ├── helmfile.yaml
│   │   └── values.yaml
│   ├── grafana/
│   │   ├── helmfile.yaml
│   │   └── values.yaml
│   └── cert-manager/
│       └── helmfile.yaml
└── .github/workflows/
    └── helmfile-deploy.yml        # GitOps CI/CD
```

---

## GitOps Workflow

**Principle**: Git as single source of truth for infrastructure

```
Developer Commits → GitHub → CI/CD Pipeline → Helmfile → Kubernetes
```

**GitHub Actions Stages**:
1. **Diff**: Preview infrastructure changes (all commits)
2. **Sync**: Reconcile cluster state (main/dev only)
3. **Apply**: Deploy changes (main/dev only)

**Benefits**:
- Auditable infrastructure changes
- Rollback capability via Git
- Automated testing before deployment
- Collaborative infrastructure management

---

## Helmfile Configuration

**Main Helmfile** (`helmfile.yaml`):
```yaml
helmDefaults:
  atomic: true        # Rollback on failure
  wait: true          # Wait for resources

helmfiles:
  - path: applications/ingress/helmfile.yaml
  - path: applications/mongodb-sharded/helmfile.yaml
  - path: applications/prometheus/helmfile.yaml
  - path: applications/grafana/helmfile.yaml
```

**Features**:
- Declarative multi-release management
- Environment-specific configurations
- Dependency management between releases
- Parallel deployment support

---

## Quick Start

### Prerequisites
```bash
# Install Helmfile
brew install helmfile  # macOS
# or download from: github.com/helmfile/helmfile

# Install Helm diff plugin
helm plugin install https://github.com/databus23/helm-diff

# Configure kubectl
kubectl config use-context <your-cluster>
```

### Deploy All Infrastructure
```bash
# Clone repository
git clone https://github.com/Liafonx/scalyshop-cluster-management.git
cd scalyshop-cluster-management

# Preview changes
helmfile diff

# Deploy everything
helmfile sync

# Or apply (similar to sync)
helmfile apply
```

### Deploy Specific Component
```bash
# Deploy only NGINX Ingress
helmfile -f applications/ingress/helmfile.yaml sync

# Deploy only MongoDB
helmfile -f applications/mongodb-sharded/helmfile.yaml sync

# Deploy monitoring stack
helmfile -f applications/prometheus/helmfile.yaml sync
helmfile -f applications/grafana/helmfile.yaml sync
```

### Update Configuration
```bash
# 1. Edit values file
vi applications/mongodb-sharded/values.yaml

# 2. Preview changes
helmfile diff

# 3. Apply changes
helmfile sync
```

---

## Monitoring Access

### Prometheus
```bash
# Port-forward
kubectl port-forward -n gitlab-managed-apps \
  svc/prometheus-server 9090:80

# Access: http://localhost:9090
```

### Grafana
```bash
# Get password
kubectl get secret grafana -n gitlab-managed-apps \
  -o jsonpath="{.data.admin-password}" | base64 -d

# Port-forward
kubectl port-forward -n gitlab-managed-apps \
  svc/grafana 3000:80

# Access: http://localhost:3000
# Username: admin
```

---

## CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/helmfile-deploy.yml`):

```yaml
Trigger: Push/PR to main or dev

Jobs:
  1. Diff:
     - Install Helmfile, Helm, kubectl
     - Run helmfile diff
     - Preview infrastructure changes
  
  2. Sync (push only):
     - Ensure namespaces exist
     - Run helmfile sync
     - Reconcile cluster state
  
  3. Deploy (after sync):
     - Run helmfile apply
     - Verify deployments
```

**Workflow Features**:
- Automated infrastructure deployment
- Pull request preview (diff only)
- Environment-based deployment (main/dev)
- Deployment verification

---

## Infrastructure Patterns

### High Availability
- **MongoDB**: Replica sets with automatic failover
- **Ingress**: Multiple controller replicas
- **Monitoring**: Persistent storage for metrics

### Scalability
- **Horizontal**: Add MongoDB shards for data growth
- **Vertical**: Resource limits configurable per component
- **Auto-scaling**: HPA for application layers (not infrastructure)

### Security
- **RBAC**: Service accounts with minimal permissions
- **Network Policies**: Pod-to-pod communication rules
- **Secrets Management**: Kubernetes Secrets for credentials
- **SSL/TLS**: Cert-Manager for automated certificates

---

## Scaling Strategies

### MongoDB Sharding
```yaml
# Add more shards in values.yaml
shards: 3  # Increase from 2

# Apply changes
helmfile -f applications/mongodb-sharded/helmfile.yaml sync
```

### Resource Scaling
```yaml
# Increase resources in values.yaml
resources:
  requests:
    cpu: 500m
    memory: 2Gi
  limits:
    cpu: 2000m
    memory: 4Gi
```

---

## Related Repositories

- **Backend**: [scalyshop-v2-backend](https://github.com/Liafonx/scalyshop-v2-backend)
- **Frontend**: [scalyshop-v2-frontend](https://github.com/Liafonx/scalyshop-v2-frontend)
- **Overview**: [scalyshop-v2](https://github.com/Liafonx/scalyshop-v2)

---

<!-- ## Skills Demonstrated

- **Infrastructure-as-Code**: Helmfile, declarative infrastructure
- **GitOps**: Git-based infrastructure management
- **Kubernetes**: Cluster management, resource orchestration
- **Helm**: Package management, templating
- **Database Administration**: MongoDB sharding, replica sets
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **Load Balancing**: NGINX Ingress configuration
- **CI/CD**: GitHub Actions, automated deployments
- **DevOps**: Infrastructure automation, configuration management
- **Distributed Systems**: Sharding, replication, high availability -->
