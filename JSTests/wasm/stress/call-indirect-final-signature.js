import * as assert from "../assert.js"
import { instantiate } from "../gc/wast-wrapper.js"

const { ok, bad, subtype } = instantiate(`
(module
  (type $retI32 (func (result i32)))
  (type $retI64 (func (result i64)))
  (type $base (sub (func (result i32))))
  (type $child (sub $base (func (result i32))))
  (table 3 funcref)
  (func $one (type $retI32) (i32.const 1))
  (func $two (type $retI64) (i64.const 2))
  (func $from-child (type $child) (i32.const 3))
  (elem (i32.const 0) $one $two $from-child)
  (func (export "ok") (result i32)
    (call_indirect (type $retI32) (i32.const 0)))
  (func (export "bad") (result i32)
    (call_indirect (type $retI32) (i32.const 1)))
  (func (export "subtype") (result i32)
    (call_indirect (type $base) (i32.const 2)))
)
`).exports

for (let i = 0; i < wasmTestLoopCount; ++i) {
    assert.eq(ok(), 1)
    assert.eq(subtype(), 3)
    assert.throws(bad, WebAssembly.RuntimeError, "signature")
}
