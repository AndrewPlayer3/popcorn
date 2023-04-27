import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import loginStatus from '../helpers/login-status'

import Results from '../components/Results.js'
import Layout from '../components/Layout.js'
import LoginForm from '../components/LoginForm.js'

export async function getServerSideProps(context) {
    var qry = ''
    if (context.query.text_query)
        qry = '?text_query=' + context.query.text_query

    const res = await fetch(process.env.HOST_NAME + '/api/videos' + qry, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await res.json()

    return {
        props: {
            videos: data.query_results,
        },
    }
}

export default function Home({ videos }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    return (
        <>
        {loginStatus(status, router, false) ? (
            <>
                {(videos.length === 0) ? (
                    <h1 className="absolute left-1/4 h-2/4 w-2/4 pt-10 text-center text-2xl text-slate-200">
                        Sorry, we could not find any videos matching that search.
                    </h1>
                ): (
                <>
                    {' '}
                    {/* Result is the json file of video data/ */}
                    <Results
                        result={videos}
                        classes={
                            'h-auto px-5 mt-4 text-white sm:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6'
                        }
                    />
                </>)}
            </>
        ) : (
            <>
                <div className="flex justify-center">
                    <LoginForm />
                </div>
            </>
        )}    
    </>)
}

Home.layout = Layout
