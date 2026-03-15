export const HomePage = () => {
  return (
    <main className="min-h-screen bg-base-200 p-6">
      <section className="mx-auto max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl">Home</h1>
            <p>Welcome to the community portal starter.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">One</button>
              <button className="btn btn-primary">Create first post</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
