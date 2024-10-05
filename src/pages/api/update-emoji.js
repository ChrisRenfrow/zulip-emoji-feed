import fetchData from '../../scripts/fetchData.js'

export async function GET({ request }) {
  try {
    const updatedData = await fetchData()
    return new Response(
      JSON.stringify({ success: true, count: updatedData.length }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error updating emoji:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Could not update emoji, check again later',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
