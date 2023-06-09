import { useState } from 'react'
import { Formik, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

export default function UploadForm({ className }) {
    const [thumbnail, setThumbnail] = useState(null)
    const [video, setVideo] = useState(null)
    const [createObjectURL, setCreateObjectURL] = useState(null)

    const uploadThumbnailToClient = (event) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0]
            if (i.type.split('/')[0] != 'image') {
                alert('File type not supported: File must be an image.')
                return
            }
            setThumbnail(i)
            setCreateObjectURL(URL.createObjectURL(i))
        }
    }

    const uploadVideoToClient = (event) => {
        if (event.target.files && event.target.files[0]) {
            const i = event.target.files[0]
            if (i.type.split('/')[0] != 'video') {
                alert('File type not supported: File must be a video.')
                return
            }
            setVideo(i)
            setCreateObjectURL(URL.createObjectURL(i))
        }
    }

    const uploadToServer = async (id, type) => {
        const is_video = type == 'video'
        const file = is_video ? video : thumbnail

        const signedurl_res = await fetch(
            process.env.HOST_NAME + '/api/videos/' + id + '/upload',
            {
                method: 'POST',
                body: JSON.stringify({
                    filetype: file.type,
                    is_video: is_video,
                }),
            }
        )

        const signedurl_data = await signedurl_res.json()
        const signedurl = signedurl_data.upload_url

        const upload = await fetch(signedurl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        })

        return signedurl_data.filename
    }

    return (
        <>
            <Formik
                initialValues={{
                    title: '',
                    description: '',
                    tags: '',
                    video_length: '',
                }}
                validationSchema={Yup.object({
                    title: Yup.string().required('Please enter a title'),
                    description: Yup.string().required(
                        'Please enter a description'
                    ),
                    tags: Yup.string().required('Please add some tags.'),
                    video_length: Yup.number().required(
                        'Please enter the length of the video in seconds.'
                    ),
                })}
                onSubmit={async (values, { resetForm }) => {
                    console.log(JSON.stringify(values))

                    const res = await fetch(
                        process.env.HOST_NAME + '/api/videos',
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                redirect: false,
                                title: values.title,
                                description: values.description,
                                tags: values.tags
                                    .split(',')
                                    .map(function (item) {
                                        return item.trim()
                                    }),
                                length: values.video_length,
                                callbackUrl: `${window.location.origin}`,
                            }),
                        }
                    )
                    const data = await res.json()
                    const video_info = data.videocreated

                    const video_loc = await uploadToServer(
                        video_info._id,
                        'video'
                    )
                    const thumbnail_loc = await uploadToServer(
                        video_info._id,
                        'thumbnail'
                    )

                    console.log('Thumbnail URL: ', thumbnail_loc)
                    console.log('Video URL: ', video_loc)

                    if (!video_loc || !thumbnail_loc) {
                        alert('There was an error uploading the video.')

                        const del_res = await fetch(
                            process.env.HOST_NAME +
                                '/api/videos/' +
                                video_info._id,
                            {
                                method: 'DELETE',
                            }
                        )
                        return
                    } else {
                        const add_filenames = await fetch(
                            process.env.HOST_NAME +
                                '/api/videos/' +
                                video_info._id,
                            {
                                method: 'PATCH',
                                body: JSON.stringify({
                                    filename: video_loc,
                                    thumbnail: thumbnail_loc,
                                }),
                            }
                        )
                    }

                    alert(values.title + ' has been uploaded.')

                    setThumbnail(null)
                    setVideo(null)
                    resetForm()
                }}
            >
                {(formik) => (
                    <form onSubmit={formik.handleSubmit}>
                        <div className="form shadow-lg shadow-[#4A017F]">
                            <div className="px-4 pt-4 pb-4">
                                <div className="mb-4">
                                    <label
                                        htmlFor="title"
                                        className="form_text"
                                    >
                                        title
                                        <Field
                                            name="title"
                                            aria-label="enter the title"
                                            aria-required="true"
                                            type="text"
                                            className="form_input"
                                        />
                                    </label>

                                    <div className="text-sm text-red-600">
                                        <ErrorMessage name="title" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="description"
                                        className="form_text"
                                    >
                                        description
                                        <Field
                                            name="description"
                                            aria-label="enter a description for the video"
                                            aria-required="true"
                                            type="text"
                                            className="form_input"
                                        />
                                    </label>

                                    <div className="text-sm text-red-600">
                                        <ErrorMessage name="description" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="tags" className="form_text">
                                        tags [comma seperated list]
                                        <Field
                                            name="tags"
                                            aria-label="enter a comma seperated list of tags for the video"
                                            aria-required="true"
                                            type="text"
                                            className="form_input"
                                        />
                                    </label>

                                    <div className="text-sm text-red-600">
                                        <ErrorMessage name="tags" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="video_length"
                                        className="form_text"
                                    >
                                        length of the video in seconds
                                        <Field
                                            name="video_length"
                                            aria-label="enter the length of the video in seconds"
                                            aria-required="true"
                                            type="text"
                                            className="form_input"
                                        />
                                    </label>

                                    <div className="text-sm text-red-600">
                                        <ErrorMessage name="video_length" />
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <label
                                        className="form_text hover:border-b-solid cursor-pointer hover:border-b hover:border-b-stone-800 hover:shadow-lg"
                                        htmlFor="video_location"
                                    >
                                        <Field
                                            type="file"
                                            className="hidden"
                                            id="video_location"
                                            name="video_location"
                                            onChange={uploadVideoToClient}
                                        />
                                        Select the Video File{' '}
                                        {video ? '✅ ' : ''}
                                    </label>
                                </div>
                                <div className="mt-4">
                                    <label
                                        className="form_text hover:border-b-solid cursor-pointer hover:border-b hover:border-b-stone-800 hover:shadow-lg"
                                        htmlFor="thumbnail_location"
                                    >
                                        <Field
                                            type="file"
                                            className="hidden"
                                            id="thumbnail_location"
                                            name="thumbnail_location"
                                            onChange={uploadThumbnailToClient}
                                        />
                                        Select the Thumbnail File{' '}
                                        {thumbnail ? '✅' : ''}
                                    </label>
                                </div>
                                <div className="mt-8 flex items-center justify-center">
                                    <button
                                        type="submit"
                                        className="form_button_alt"
                                    >
                                        {formik.isSubmitting
                                            ? 'Please wait...'
                                            : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    )
}
