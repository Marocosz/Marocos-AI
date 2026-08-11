import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Shell from './os/shell/Shell'

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
