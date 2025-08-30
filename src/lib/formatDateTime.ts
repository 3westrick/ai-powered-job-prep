const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

export default function formatDateTime(date: Date) {
    return formatter.format(date)
}
