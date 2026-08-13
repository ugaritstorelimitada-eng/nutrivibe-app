// Google Identity Services type declarations
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClientConfig {
        client_id: string
        scope: string
        callback: (response: any) => void
      }
      function initTokenClient(config: TokenClientConfig): any
    }
  }
}
