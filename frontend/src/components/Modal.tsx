"use client"

import React from "react"
import Image from "next/image"

import { useState, useEffect } from "react"

function Modal({
	closeModal,
	width,
	height,
	children,
}: {
	closeModal: () => void,
	width?: number,
	height?: number,
	children: React.ReactNode,
}): JSX.Element {

	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setIsVisible(true)
	}, [])

	const handleCloseModal = () => {

		setIsVisible(false)
		setTimeout(() => {
			closeModal()
		}, 200)
	}

	return (
		<div
			onClick={handleCloseModal}
			className={`z-10 duration-200 fixed inset-0 flex justify-center items-center transition-all
			${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
			backdrop-blur bg-black/20`}
		>
			<div
				style={{ height, width }}
				onClick={(e) => e.stopPropagation()}
				className={`max-w-3xl p-6 transition-all flex flex-row duration-200
					border-[4px] border-neutral-800 bg-gradient-to-tr from-violet-500/70
					via-red-500/70 to-purple-900/70 rounded-[2.5rem] shadow origin-center
					justify-between
					${isVisible ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
			>
				<button
					onClick={handleCloseModal}
					className="absolute top-2 right-2 p-2 transition-all rounded-full bg-black
						bg-opacity-0 hover:bg-black/30 active:bg-black/65"
				>
					<Image
						src={"/cross.png"}
						width={20}
						height={20}
						alt="Fermer"
					/>
				</button>
				{children}
			</div>
		</div>
	)
}

export default Modal
