import { useEffect, useState, useRef } from "react"

interface Post {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
}

const ITEMS_PER_PAGE = 3;

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 🔁 Caching reference for page data
  const cacheRef = useRef<Map<number, Post[]>>(new Map());

  // 🔁 Ref for aborting fetch requests
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);

      // ✅ Check cache first
      if (cacheRef.current.has(page)) {
        setPosts(cacheRef.current.get(page)!);
        setIsLoading(false);
        return;
      }

      // Else fetch from API
      abortController.current?.abort(); // abort previous request if any
      abortController.current = new AbortController();

      try {
        const response = await fetch(`https://fakestoreapi.com/products`, {
          signal: abortController.current.signal,
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data: Post[] = await response.json();

        // 🧠 Slice only the current page's posts
        const total = data.length;
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

        const sliced = data.slice(
          (page - 1) * ITEMS_PER_PAGE,
          page * ITEMS_PER_PAGE
        );

        // 💾 Cache the current page's slice
        cacheRef.current.set(page, sliced);

        setPosts(sliced);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Request aborted");
        } else {
          setError((err as Error).message || "Unknown error");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();

    return () => {
      abortController.current?.abort();
    };
  }, [page]);

  return (
    <div className="container mx-auto bg-pink-200 p-4 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold underline text-red text-center mb-5">Fake SHOP</h1>

      {isLoading && <span className="text-xl text-indigo-500">Loading...</span>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-center gap-4 my-4">
        <button
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={() => setPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      <p className="text-center">Current page: {page} / {totalPages}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <div key={post.id} className="bg-pink-400 p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <p>{post.description}</p>
            <p className="font-bold">Price: ${post.price}</p>
            <img src={post.image} alt={post.title} className="w-full h-auto mt-2" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-6 ">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`px-7 py-5 rounded font-bold text-lg cursor-pointer hover:bg-gray-200 ${
              pageNumber === page ? "bg-blue-500 text-white" : "bg-white text-black border"
            }`}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
