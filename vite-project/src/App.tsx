import { useEffect, useState, useRef } from "react"

interface Post {
  id: number;
  title: string;
  body: string;
}
function App() {
const [posts, setPosts] = useState<Post[]>([])
const [isloading, setIsloading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [page, setPage] = useState<number>(1)
const [totalCountPage, setTotalCountPage] = useState<number>(1)

const abourtController = useRef<AbortController>(null)

  useEffect(() => {
  console.log('hello fetch request')
async function fetchGetPosts() {
setIsloading(true) // Set loading state to true before fetching data

abourtController.current = new AbortController();

try {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=6`, {signal: abourtController.current.signal}); // Fetch data from the API
  if (!response.ok) {
    throw new Error('Network response was not ok'); // Throw an error if the response is not ok
  }
  const totalCount = response.headers.get('X-Total-Count'); // Get the total count from the response headers
  setTotalCountPage(Math.ceil(Number(totalCount) / 6)) // Calculate the total number of pages based on the total count and limit
  console.log(totalCount);
  const data = await response.json(); // Parse the response as JSON
  setPosts(data); // Update the state with the fetched data

} catch (error: unknown) {
  // Перевіряємо, чи помилка викликана скасуванням запиту
  if (error instanceof DOMException && error.name === "AbortError") {
    // Це помилка скасування запиту (AbortError)
    console.log("Request aborted");
    return;
  } else if (error instanceof Error) {
    setError(error.message);
  } else {
    setError("Невідома помилка");
  }
}
  setIsloading(false)
}
fetchGetPosts()

return () => {
  if (abourtController.current) {
    abourtController.current?.abort();
  }
}
  }, [page])
console.log(totalCountPage);


  return (
    <div className="container mx-auto bg-pink-200 p-4">
     <h1 className="text-3xl font-bold underline text-red text-center mb-5">hello Fetch</h1>
     {isloading &&<span className="text-xl text-indigo-500 text-center">loading...</span>}

<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setPage(Math.max(page - 1,1))}>Back</button>
<button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2" onClick={() => setPage(page + 1)}>Next</button>

     <p>Current page: {page}</p>
     <p>Total pages: {totalCountPage}</p>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <div key={post.id} className="bg-blue-400 p-4 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-5 justify-center my-6 items-center">
        {Array.from({ length: totalCountPage }, (_, index) => index + 1).map(
          (pageNumber) => (
            <div
              className={`font-bold text-2xl text-pink-700 cursor-pointer ${pageNumber === page ? "text-5xl text-white flex items-center justify-center bg-blue-400 p-4 rounded-4xl" : "text-2xl"}`}
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default App
