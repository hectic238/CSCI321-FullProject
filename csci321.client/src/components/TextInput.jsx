export default function TextInput({ placeholder, addLabel, labelText }) {
    return (
        <div>
            {addLabel && (
                <label htmlFor="input" className="text-sm font-medium text-gray-900">
                    {labelText}
                </label>
            )}
            <div className="relative rounded-md shadow-sm">
                <input
                    id="input"
                    name="input"
                    type="text"
                    placeholder={placeholder}
                    className="w-full rounded-md border-0 text-gray-900 placeholder:text-gray-400 "
                />
            </div>
        </div>
    )
}
