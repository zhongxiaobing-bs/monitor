export default function PayloadBlock({ payload }: { payload: unknown }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: 12,
        borderRadius: 8,
        background: '#f5f5f5',
        overflowX: 'auto',
        fontSize: 12,
        lineHeight: 1.5
      }}
    >
      {JSON.stringify(payload, null, 2)}
    </pre>
  )
}
