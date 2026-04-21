# 需求追踪矩阵

| requirement_id | priority | description | contract_ref | design_ref | code_ref | test_ref | status | waived_reason |
|----------------|----------|-------------|--------------|------------|----------|----------|--------|---------------|
| FR-01 | P0 | 发送邮箱验证码 | contracts/openapi.yaml#/paths/~1verification-codes/post | UI设计待补充 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| FR-02 | P0 | 用户注册 | contracts/openapi.yaml#/paths/~1users/post | UI设计待补充 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| FR-03 | P0 | 用户登录 | contracts/openapi.yaml#/paths/~1auth~1login/post | UI设计待补充 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| FR-04 | P0 | 自动创建 OKX Agent Wallet | docs/prd.md#fr-04-自动创建-okx-agent-wallet | 无UI界面 | 后端待实现 | 测试用例待补充 | TODO | - |
| FR-05 | P0 | 获取当前用户信息 | contracts/openapi.yaml#/paths/~1me/get | UI设计待补充 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| FR-06 | P1 | Token刷新机制 | contracts/openapi.yaml#/paths/~1auth~1refresh/post | 无UI界面 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| FR-07 | P1 | 查询钱包创建状态 | contracts/openapi.yaml#/paths/~1wallets~1status/get | UI设计待补充 | 后端待实现<br>前端待实现 | 测试用例待补充 | TODO | - |
| NF-01 | P0 | 性能要求 | docs/prd.md#nf-01-性能要求 | - | 后端待实现 | 性能测试待补充 | TODO | - |
| NF-02 | P0 | 安全性要求 | docs/prd.md#nf-02-安全性要求 | - | 后端待实现 | 安全测试待补充 | TODO | - |
| NF-03 | P0 | 错误处理 | contracts/openapi.yaml#/components/schemas/ErrorResponse | - | 后端待实现 | 错误测试待补充 | TODO | - |
| NF-04 | P0 | 幂等性要求 | docs/prd.md#nf-04-幂等性要求 | - | 后端待实现 | 幂等性测试待补充 | TODO | - |
| NF-05 | P0 | 可追踪性 | contracts/openapi.yaml#/components/schemas/ErrorResponse | - | 后端待实现 | 追踪测试待补充 | TODO | - |

## 状态说明
- **TODO**: 需求已确认，待开始
- **IN_PROGRESS**: 开发/设计中
- **REVIEW**: 代码/设计评审中
- **DONE**: 已完成
- **BLOCKED**: 被阻塞
- **WAIVED**: 已豁免，需填写豁免原因

## 更新记录
| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2024-01-01 | 1.0.0 | 初始版本 | 产品经理Agent |
