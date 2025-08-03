import { useEffect, useState } from "react";

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

  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const response = await fetch(`https://fakestoreapi.com/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError((err as Error).message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const paginatedPosts = posts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto bg-pink-200 p-4">
      <h1 className="text-3xl font-bold underline text-red text-center mb-5">
        Fake SHOP
      </h1>

      {isLoading && <p className="text-xl text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="flex justify-center gap-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Back
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <p className="text-center mb-2">Current page: {page}</p>
      <p className="text-center mb-6">Total pages: {totalPages}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedPosts.map((post) => (
          <div key={post.id} className="bg-pink-400 p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <p>{post.description}</p>
            <p className="font-bold">Price: ${post.price}</p>
            <img src={post.image} alt={post.title} className="w-full h-40 object-contain" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-4 justify-center my-6">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`font-bold py-2 px-4 rounded ${
                pageNumber === page
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border"
              }`}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default App;
