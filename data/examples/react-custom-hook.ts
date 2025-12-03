import type { CodeExample } from "./types";

export const reactCustomHook: CodeExample = {
  id: "react-custom-hook",
  title: "Custom React Hook",
  description: "Extract reusable logic into custom hooks",
  steps: [
    {
      title: "Step 1: Component with API logic",
      previousCode: "",
      currentCode: `function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>{products.length} products</div>
}`,
      language: "typescript",
      fileName: "ProductList.tsx",
    },
    {
      title: "Step 2: Extract to custom hook",
      previousCode: `function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>{products.length} products</div>
}`,
      currentCode: `function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  return { data, loading }
}

function ProductList() {
  const { data: products, loading } = useFetch("/api/products")
  
  if (loading) return <div>Loading...</div>
  return <div>{products.length} products</div>
}`,
      language: "typescript",
      fileName: "ProductList.tsx",
    },
  ],
};

