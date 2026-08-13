import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * O renderizador de markdown das respostas do agente, isolado num módulo
 * próprio para poder ser carregado sob demanda.
 *
 * react-markdown + remark-gfm + micromark somam dezenas de KB e serviam a UM
 * dos onze apps — e, dentro dele, só depois da primeira resposta. O estado
 * vazio do assistente é texto puro e não precisa de nada disso.
 */
const AssistantMarkdown = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    }}
  >
    {children}
  </ReactMarkdown>
)

export default AssistantMarkdown
