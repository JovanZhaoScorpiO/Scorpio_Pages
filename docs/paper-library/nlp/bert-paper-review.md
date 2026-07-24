---
title: 'BERT：预训练深度双向 Transformer 的语言理解'
author: 'J. Devlin, M. Chang, K. Lee et al.'
field: '自然语言处理'
conference: 'NAACL 2019'
year: 2019
doi: '10.48550/arXiv.1810.04805'
keywords:
  - BERT
  - 预训练
  - 语言模型
  - 双向编码
tags:
  - BERT
  - 预训练
  - NLP
  - Transformer
  - 语言模型
  - 自然语言处理
---

# BERT：预训练深度双向 Transformer 的语言理解

**BERT: PRE-TRAINING OF DEEP BIDIRECTIONAL TRANSFORMERS FOR LANGUAGE UNDERSTANDING**

<div style="padding: 1rem; background: var(--vp-c-bg-soft); border-radius: 6px; margin: 1rem 0; font-size: 0.85rem;">

| 元数据 | |
|--------|---|
| **作者** | J. Devlin, M. Chang, K. Lee et al. (Google AI) |
| **会议** | NAACL 2019 (Best Long Paper) |
| **年份** | 2019 |
| **DOI** | [10.48550/arXiv.1810.04805](https://doi.org/10.48550/arXiv.1810.04805) |
| **关键词** | BERT, 预训练, 双向编码 |

</div>

## 一、核心创新点

1. **深度双向预训练** — 不同于 GPT 的自左向右单向建模和 ELMo 的浅层双向拼接，BERT 通过 **Masked Language Model (MLM)** 实现真正的深层双向表示。
2. **Next Sentence Prediction (NSP)** — 通过预测两段文本是否为连续语句，学习句间关系，显著提升 QA 和 NLI 任务表现。
3. **极致微调框架** — 统一架构适配各类 NLP 任务：仅需在预训练模型顶层加一个线性层，无需修改模型结构。

## 二、预训练目标

### Masked Language Model (MLM)

随机 Mask 输入中 15% 的 token，训练模型预测被 Mask 的 token：

$$
\mathcal{L}_{\text{MLM}} = -\sum_{i \in \mathcal{M}} \log P(x_i | \mathbf{x}_{\setminus \mathcal{M}})
$$

其中 $\mathcal{M}$ 是被 Mask 的位置集合。

**特殊策略**（而非全部用 `[MASK]` 替换）：
- 80% 概率替换为 `[MASK]`
- 10% 概率替换为随机 token
- 10% 概率保持不变

### Next Sentence Prediction (NSP)

给定句子 A 和句子 B，预测 B 是否为 A 的下一句：

$$
\mathcal{L}_{\text{NSP}} = -\log P(\text{IsNext} | A, B)
$$

## 三、实验记录

### GLUE Benchmark 结果

| 任务 | BERT-Base | BERT-Large | 之前 SOTA |
|------|-----------|------------|-----------|
| MNLI | 86.7 | **87.9** | 86.0 |
| QQP | 91.3 | **92.2** | 91.1 |
| QNLI | 92.7 | **93.2** | 91.8 |
| SST-2 | 93.5 | **94.9** | 94.0 |
| STS-B | 89.3 | **90.9** | 87.8 |

### SQuAD v1.1

| 指标 | BERT-Base | BERT-Large | 人类表现 |
|------|-----------|------------|----------|
| F1 | 88.5 | **93.2** | 91.2 |
| EM | 81.0 | **87.4** | 82.3 |

> BERT-Large 在 SQuAD v1.1 上超过人类表现，是 NLP 发展史上的里程碑时刻。

## 四、个人批注

### 模型架构

BERT-Base（同 GPT 参数规模）：
```
num_layers = 12
hidden_size = 768
num_heads = 12
total_params = 110M
```

BERT-Large：
```
num_layers = 24
hidden_size = 1024
num_heads = 16
total_params = 340M
```

### 影响与遗产

BERT 的发布彻底改变了 NLP 研究范式：

1. **预训练 + 微调 成为标准范式** — 从 2018 年延续至今
2. **MLM 成为标准预训练目标** — RoBERTa 证明 MLM 的核心重要性
3. **模型即服务** — Google 推出 BERT-as-a-Service，推动 NLP 平民化
4. **衍生工作** — RoBERTa、ALBERT、DistilBERT、ELECTRA、T5

## 五、相关文献推荐

- [ ] **GPT**: Improving Language Understanding by Generative Pre-Training (Radford et al., 2018)
- [ ] **RoBERTa**: A Robustly Optimized BERT Pretraining Approach (Liu et al., 2019)
- [ ] **ALBERT**: A Lite BERT for Self-supervised Learning of Language Representations (Lan et al., ICLR 2020)
- [ ] **ELECTRA**: Pre-training Text Encoders as Discriminators Rather Than Generators (Clark et al., ICLR 2020)

## 六、参考文献

1. Devlin, J., et al. "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." NAACL 2019.
2. Radford, A., et al. "Improving Language Understanding by Generative Pre-Training." 2018.
3. Peters, M., et al. "Deep Contextualized Word Representations." NAACL 2018.

---

<RelatedContent />
