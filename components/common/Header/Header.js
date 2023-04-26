import Head from 'next/head'
import config from '../../../config/meta.json'

export default function Header() {
    return (
        <div>
            <Head>
                <title key="title">{config.title}</title>
                <meta
                    name="keywords"
                    content="basic video sharing site"
                />
                <meta
                    name="description"
                    content="Popcord is a basic video sharing type site, which was built using Next.js, MongoDB, and Google Cloud Storage for a project."
                />
            </Head>
        </div>
    )
}
