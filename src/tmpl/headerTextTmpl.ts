export function headerTextTmpl (text: string): string {
  return `
<style>
  header {
    padding: 0 20px;    
    width: 100%;
    color: #ddd;
    font-size: 10px;
    font-family: 'Courier New';
    white-space: pre;
  }
</style>

<header>${text}</header>
`
}
