---
title: 'ViT vs ResNet：视觉Transformer与卷积网络的对比分析'
author: 'A. Dosovitskiy, L. Beyer, A. Kolesnikov et al.'
field: '计算机视觉'
conference: 'NeurIPS 2021'
year: 2021
doi: '10.48550/arXiv.2010.11929'
keywords:
  - Vision Transformer
  - ResNet
  - 图像分类
  - 自注意力机制
tags:
  - Transformer
  - ViT
  - ResNet
  - 图像分类
  - 对比分析
  - 计算机视觉
---

# ViT vs ResNet：视觉Transformer与卷积网络的对比分析

**AN IMAGE IS WORTH 16X16 WORDS: TRANSFORMERS FOR IMAGE RECOGNITION AT SCALE**

<div style="padding: 1rem; background: var(--vp-c-bg-soft); border-radius: 6px; margin: 1rem 0; font-size: 0.85rem;">

| 元数据 | |
|--------|---|
| **作者** | A. Dosovitskiy, L. Beyer, A. Kolesnikov et al. (Google Research) |
| **会议** | NeurIPS 2021 |
| **年份** | 2021 |
| **DOI** | [10.48550/arXiv.2010.11929](https://doi.org/10.48550/arXiv.2010.11929) |
| **关键词** | Vision Transformer, 图像分类, 自注意力 |

</div>

## 一、核心创新点

1. **纯Transformer架构应用于视觉** — 首次证明 Transformer 可以在没有卷积操作的情况下，直接应用于图像 patch 序列，并在大规模数据集上达到或超越 SOTA CNN。
2. **图像分块策略** — 将图像分割为 $16 \times 16$ 的 patch，将其展平为序列输入 Transformer Encoder，公式化表示为：
   $$
   \mathbf{x}_p = \text{PatchEmbed}(\mathbf{I}) \in \mathbb{R}^{N \times (P^2 \cdot C)}
   $$
   其中 $N = HW / P^2$ 为 patch 数量。
3. **位置编码** — 使用可学习的一维位置编码来保留空间信息，与 NLP Transformer 不同的是无需复杂的 2D 位置编码变体即可取得良好效果。
4. **大规模预训练 > 归纳偏置** — ViT 的核心洞见：当预训练数据足够大（ImageNet-21k, JFT-300M）时，Transformer 的灵活性可以弥补缺少 CNN 内置归纳偏置的不足。

## 二、个人阅读批注

### 2.1 方法论亮点

ViT 的设计极度简洁，几乎完全照搬 NLP Transformer：

```mermaid
graph TD
    A[输入图像] --> B[将图像分割为 16×16 Patches]
    B --> C[线性投影为 Patch Embeddings]
    C --> D[加上位置编码 + [CLS] Token]
    D --> E[标准 Transformer Encoder ×L层]
    E --> F[MLP Head]
    F --> G[分类输出]
```

这种简洁性既是优点也是局限：

- **优点**：架构统一，视觉和 NLP 可以用同一套框架理解
- **局限**：缺少 CNN 的平移不变性和局部感受野，需要更多数据来学习这些先验

### 2.2 实验设计评价

| 实验设置 | ImageNet Top-1 | 参数量 | 预训练数据 |
|----------|----------------|--------|-----------|
| ViT-B/16 | 77.9% → 81.1%* | 86M | ImageNet-21k |
| ViT-L/16 | 76.5% → 82.6%* | 307M | ImageNet-21k |
| ViT-H/14 | - → 87.8%* | 632M | JFT-300M |
| ResNet-152 (BiT) | 82.8% | 928M | JFT-300M |

> *箭头前后的数字表示：在 ImageNet-1k 直接训练 → 在大规模数据预训练后微调

**关键发现**：
1. 当预训练数据量较小时，ViT 不如 ResNet（缺乏归纳偏置）
2. 当数据量充足时，ViT 显著超越 ResNet，且训练计算成本更低
3. ViT 的注意力机制在深层形成了类似 CNN 的局部感受野模式

### 2.3 局限性讨论

1. **数据需求巨大** — JFT-300M 级别的数据集对大多数研究团队不可及
2. **位置编码刚性** — 输入分辨率变化时需要插值位置编码，可能导致性能下降
3. **缺少层次化特征** — 不像 ResNet 有多尺度特征金字塔，不利于检测/分割等密集预测任务

## 三、实验记录

### 3.1 复现要点

```
# ViT-B/16 配置关键参数
patch_size = 16
hidden_dim = 768
num_layers = 12
num_heads = 12
mlp_ratio = 4
dropout = 0.1
```

### 3.2 后续工作影响

ViT 引发了视觉 Transformer 的爆发式发展：

1. **DeiT (Data-efficient Image Transformers)** — 通过知识蒸馏减少数据需求
2. **Swin Transformer** — 引入层次化窗口注意力，解决 ViT 的多尺度问题
3. **MAE (Masked Autoencoders)** — 将自监督预训练引入 ViT
4. **DINO** — 自蒸馏 + ViT 实现无监督视觉特征学习

## 四、相关文献推荐

- [ ] **DeiT**: Training data-efficient image transformers & distillation through attention (Touvron et al., ICML 2021)
- [ ] **Swin Transformer**: Hierarchical vision transformer using shifted windows (Liu et al., ICCV 2021)
- [ ] **MAE**: Masked autoencoders are scalable vision learners (He et al., CVPR 2022)
- [ ] **ResNet**: Deep residual learning for image recognition (He et al., CVPR 2016)

## 五、参考文献

1. Dosovitskiy, A., et al. "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale." NeurIPS 2021.
2. Vaswani, A., et al. "Attention is All You Need." NeurIPS 2017.
3. He, K., et al. "Deep Residual Learning for Image Recognition." CVPR 2016.

---

<RelatedContent />
