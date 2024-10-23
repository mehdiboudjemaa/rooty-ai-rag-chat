import AdminForm from '@/components/AdminForm'


export default function AdminPage() {
  return (
    <div className="flex justify-center items-start sm:pt-16 min-h-screen w-full dark:bg-neutral-900 px-4 md:px-0 py-4">
      <div className="flex flex-col items-center w-full max-w-[500px]">
        <h1 className="text-2xl font-bold mb-6 text-neutral-800 dark:text-red-200">Admin: Add to Knowledge Base</h1>
        <AdminForm />
      </div>
    </div>
  )
}