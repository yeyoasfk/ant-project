const HeaderBox = ({ type = "title", title, subtext, user }: { type?: string, title: string, subtext: string, user?: string }) => {
  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <h1 className="text-20 sm:text-24 md:text-28 lg:text-32 font-bold leading-tight text-gray-900">
        {title}
        {type === 'greeting' && (
          <span className="text-bankGradient block sm:inline">
            &nbsp;{user}
          </span>
        )}
      </h1>
      <p className="text-13 sm:text-14 md:text-16 font-normal text-gray-600 leading-relaxed">
        {subtext}
      </p>
    </div>
  )
}

export default HeaderBox