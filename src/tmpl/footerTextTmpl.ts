export function footerTextTmpl (text: string): string {
  return `
<style>
  footer {
    padding: 0 20px;    
    width: 100%;
    color: #ddd;
    font-size: 10px;
    font-family: 'Courier New';
    white-space: pre;
  }
</style>

<footer>${text}</footer>
`
}
