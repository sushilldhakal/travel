export default function Masonry(props: { images: Array<{ url?: string; secure_url?: string; display_name?: string; asset_id?: string; width: number; height: number }>; columnCount?: number }) {
    const { images, columnCount = 3 } = props
    const imageColumns = generateImageColumns(images, columnCount)

    return <div className={`flex ${columnCount > 1 ? 'space-x-4' : ''}`}>{renderColumns(imageColumns)}</div>
}

const getRelativeImageHeight = (image: { width: number; height: number }, targetWidth: number): number => {
    const { width, height } = image
    const widthQuotient = targetWidth / width
    const relativeHeight = widthQuotient * height

    return relativeHeight
}

function generateImageColumns(images: Array<{ url?: string; secure_url?: string; display_name?: string; asset_id?: string; width: number; height: number }>, columnCount = 3) {
    const columnHeights = Array(columnCount).fill(0)
    const columns = [...Array(columnCount)].map(() => [])

    images.forEach(image => {
        const smallestHeight = Math.min(...columnHeights)
        const indexOfSmallestHeight = columnHeights.indexOf(
            Math.min(...columnHeights)
        )

        const smallestColumn = columns[indexOfSmallestHeight] as Array<typeof image>
        smallestColumn.push(image)
        const height = getRelativeImageHeight(image, 200)
        columnHeights[indexOfSmallestHeight] = smallestHeight + height
    })

    return columns
}

const renderColumns = (columns: Array<Array<{ url?: string; secure_url?: string; display_name?: string; asset_id?: string }>>) => {
    return columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
            {column.map((image, index) => (
                <div key={image.url || index} className="relative overflow-hidden rounded-lg">
                    <img
                        src={image.secure_url || image.url}
                        alt={image.display_name || image.asset_id}
                        style={{ width: '100%' }}
                        className="w-full object-cover"
                    />
                </div>
            ))}
        </div>
    ));
};