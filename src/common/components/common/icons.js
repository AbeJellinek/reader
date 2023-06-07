import React from 'react';

export function IconHighlight() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12">
			<path fill="currentColor" d="M12,5H0V3H12Zm0,1H0V8H12ZM9,9H0v2H9Zm3-9H3V2h9Z"/>
		</svg>
	);
}

export function IconNote() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12">
			<path fill="currentColor" d="M0,7H5v5ZM0,0V6H6v6h6V0Z"/>
		</svg>
	);
}

export function IconArea() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12">
			<path fill="currentColor" d="M2,7V2H7V7Zm8,2V7H9V9H7v1H9v2h1V10h2V9ZM1,1H9V6h1V0H0V10H6V9H1Z"/>
		</svg>
	);
}

export function IconInk() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12">
			<path
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit="4"
				stroke="currentColor"
				fill="none"
				d="M 11.075423,10.940982 C 2.1007834,10.74643 3.2046232,-0.13478446 9,1.2287624 11.152259,2.2537259 10.06085,4.0872195 9,4.5910025 6.1497195,6 2.0752684,4.9659656 0.95896126,1.3633774"
			/>
		</svg>
	);
}

export function IconText() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12">
			<path
				d="M1.4375 0.4375C1.15866 0.4375 0.9375 0.658658 0.9375 0.9375L0.9375 2.46875C0.9375 2.74759 1.15866 2.96875 1.4375 2.96875L1.9375 2.96875C2.21634 2.96875 2.4375 2.74759 2.4375 2.46875L2.4375 1.9375L4.96875 1.9375L4.96875 10.0312L4.46875 10.0312C4.18991 10.0313 3.9375 10.2524 3.9375 10.5312L3.9375 11.0312C3.9375 11.3101 4.18991 11.5625 4.46875 11.5625L5.96875 11.5625L7.5 11.5625C7.77884 11.5625 8 11.3101 8 11.0312L8 10.5312C8 10.2524 7.77884 10.0312 7.5 10.0312L7 10.0312L7 1.9375L9.5 1.9375L9.5 2.46875C9.5 2.74759 9.72116 2.96875 10 2.96875L10.5312 2.96875C10.8101 2.96875 11.0312 2.74759 11.0312 2.46875L11.0312 0.9375C11.0312 0.658658 10.8101 0.4375 10.5312 0.4375L10.0312 0.4375L5.96875 0.4375L1.9375 0.4375L1.4375 0.4375Z"
				fill="currentColor"
				fillRule="nonzero"
				opacity="1"
				stroke="none"
			/>
		</svg>
	);
}

export function IconNoteLarge() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24">
			<polygon fill="currentColor" points="0.5 0.5 23.5 0.5 23.5 23.5 11.5 23.5 0.5 12.5 0.5 0.5"/>
			<polygon points="0.5 12.5 11.5 12.5 11.5 23.5 0.5 12.5" fill="#fff" opacity="0.4"/>
			<path d="M0,0V12.707L11.293,24H24V0ZM11,22.293,1.707,13H11ZM23,23H12V12H1V1H23Z"/>
		</svg>
	);
}

export function IconColor({ color }) {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16">
			<rect
				shapeRendering="geometricPrecision"
				fill={color}
				strokeWidth="1"
				x="2"
				y="2"
				stroke="rgba(0, 0, 0, 0.08)"
				width="12"
				height="12"
				rx="3"
			/>
		</svg>
	);
}

// https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/user.svg
export function IconUser() {
	return (
		<svg width="8" viewBox="0 0 448 512">
			<path fill="currentColor" d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/>
		</svg>
	);
}

export function IconTreeItemCollapsed() {
	return (
		<svg width="16" height="16">
			<path fill="currentColor" d="M13 9L6 5v8z"/>
		</svg>
	);
}

export function IconTreeItemExpanded() {
	return (
		<svg width="16" height="16">
			<path fill="currentColor" d="M10 13l4-7H6z"/>
		</svg>
	);
}