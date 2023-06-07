import React, {
	useState
} from 'react';
import {
	caretPositionFromPoint,
	collapseToOneCharacterAtStart,
	splitRangeToTextNodes,
	supportsCaretPositionFromPoint
} from "../../lib/range";
import { AnnotationType } from "../../../../common/types";
import ReactDOM from "react-dom";
import { IconNoteLarge } from "../../../../common/components/common/icons";
import { closestElement } from "../../lib/nodes";

export type DisplayedAnnotation = {
	id?: string;
	type: AnnotationType;
	color?: string;
	sortIndex?: string;
	text?: string;
	comment?: string;
	key: string;
	range: Range;
};

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = (props) => {
	let { annotations, selectedAnnotationIDs, onSelect, onDragStart, onResize, disablePointerEvents } = props;
	
	let [widgetContainer, setWidgetContainer] = useState<Element | null>(null);
	
	let handlePointerDown = (event: React.PointerEvent, id: string) => {
		if (event.button !== 0) {
			return;
		}
		// Cycle selection if clicked annotation is already selected
		if (selectedAnnotationIDs.includes(id)) {
			let targets = event.view.document.elementsFromPoint(event.clientX, event.clientY)
				.filter(target => !!target.getAttribute('data-annotation-id'));
			if (!targets.length) {
				return;
			}
			let nextTarget = targets[(targets.indexOf(event.target as Element) + 1) % targets.length];
			onSelect(nextTarget.getAttribute('data-annotation-id')!);
		}
		else {
			onSelect(id);
		}
	};
	
	return <>
		<svg
			className="annotation-container"
			style={{
				mixBlendMode: 'multiply',
				zIndex: '9999',
				pointerEvents: 'none',
				position: 'absolute',
				left: '0',
				top: '0',
				overflow: 'visible'
			}}
		>
			{annotations.filter(annotation => annotation.type == 'highlight').map((annotation) => {
				if (annotation.id) {
					return (
						<Highlight
							annotation={annotation}
							key={annotation.key}
							selected={selectedAnnotationIDs.includes(annotation.id)}
							onPointerDown={event => handlePointerDown(event, annotation.id!)}
							onDragStart={dataTransfer => onDragStart(dataTransfer, annotation.id!)}
							onResize={range => onResize(annotation.id!, range)}
							disablePointerEvents={disablePointerEvents}
							widgetContainer={widgetContainer}
						/>
					);
				}
				else {
					return (
						<Highlight
							annotation={annotation}
							key={annotation.key}
							selected={false}
							disablePointerEvents={true}
							widgetContainer={widgetContainer}
						/>
					);
				}
			})}
		</svg>
		<svg
			className="annotation-container"
			style={{
				zIndex: '9999',
				pointerEvents: 'none',
				position: 'absolute',
				left: '0',
				top: '0',
				overflow: 'visible'
			}}
			ref={c => setWidgetContainer(c)}
		>
			<StaggeredNotes
				annotations={annotations.filter(a => a.type == 'note')}
				selectedAnnotationIDs={selectedAnnotationIDs}
				onPointerDown={handlePointerDown}
				onDragStart={onDragStart}
				disablePointerEvents={disablePointerEvents}
			/>
		</svg>
	</>;
};
AnnotationOverlay.displayName = 'AnnotationOverlay';

type AnnotationOverlayProps = {
	annotations: DisplayedAnnotation[];
	selectedAnnotationIDs: string[];
	onSelect: (id: string) => void;
	onDragStart: (dataTransfer: DataTransfer, id: string) => void;
	onResize: (id: string, range: Range) => void;
	disablePointerEvents: boolean;
};

const Highlight: React.FC<HighlightProps> = (props) => {
	let { annotation, selected, onPointerDown, onDragStart, onResize, disablePointerEvents, widgetContainer } = props;
	let [dragImage, setDragImage] = useState<Element | null>(null);
	let [isResizing, setResizing] = useState(false);

	let ranges = splitRangeToTextNodes(annotation.range);
	if (!ranges.length) {
		return null;
	}
	const doc = ranges[0].commonAncestorContainer.ownerDocument;
	if (!doc || !doc.defaultView) {
		return null;
	}

	let handleDragStart = (event: React.DragEvent) => {
		if (!onDragStart || annotation.text === undefined) {
			return;
		}

		let elem = (event.target as Element).closest('g')!;
		let br = elem.getBoundingClientRect();
		event.dataTransfer.setDragImage(elem, event.clientX - br.left, event.clientY - br.top);
		onDragStart(event.dataTransfer);
	};

	let handleDragEnd = () => {
		if (dragImage) {
			dragImage.remove();
			setDragImage(null);
		}
	};

	let highlightRects = new Map<string, DOMRect>();
	for (let range of ranges) {
		for (let rect of range.getClientRects()) {
			if (rect.width == 0 || rect.height == 0) {
				continue;
			}
			let key = JSON.stringify(rect);
			if (!highlightRects.has(key)) {
				highlightRects.set(key, rect);
			}
		}
	}

	let commentIconPosition;
	if (annotation.comment) {
		let commentIconRange = ranges[0].cloneRange();
		collapseToOneCharacterAtStart(commentIconRange);
		let rect = commentIconRange.getBoundingClientRect();
		commentIconPosition = { x: rect.x + doc.defaultView!.scrollX, y: rect.y + doc.defaultView!.scrollY };
	}
	else {
		commentIconPosition = null;
	}
	return <>
		<g fill={annotation.color}>
			{[...highlightRects.entries()].map(([key, rect]) => (
				<rect
					x={rect.x + doc.defaultView!.scrollX}
					y={rect.y + doc.defaultView!.scrollY}
					width={rect.width}
					height={rect.height}
					opacity="50%"
					key={key}/>
			))}
			{!disablePointerEvents && !isResizing && [...highlightRects.entries()].map(([key, rect]) => (
				// Yes, this is horrible, but SVGs don't support drag events without embedding HTML in a <foreignObject>
				<foreignObject
					x={rect.x + doc.defaultView!.scrollX}
					y={rect.y + doc.defaultView!.scrollY}
					width={rect.width}
					height={rect.height}
					key={key + '-foreign'}
				>
					<div
						// @ts-ignore
						xmlns="http://www.w3.org/1999/xhtml"
						style={{
							pointerEvents: 'auto',
							cursor: 'pointer',
							width: '100%',
							height: '100%',
						}}
						draggable={true}
						onPointerDown={onPointerDown}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						data-annotation-id={annotation.id}/>
				</foreignObject>
			))}
			{(!disablePointerEvents || isResizing) && onResize && selected && supportsCaretPositionFromPoint() && (
				<Resizer
					annotation={annotation}
					highlightRects={[...highlightRects.values()]}
					onPointerDown={() => setResizing(true)}
					onPointerUp={() => setResizing(false)}
					onResize={onResize}
				/>
			)}
		</g>
		{widgetContainer && ((selected && !isResizing) || commentIconPosition) && ReactDOM.createPortal(
			<>
				{selected && !isResizing && (
					<RangeSelectionBorder range={annotation.range}/>
				)}
				{commentIconPosition && (
					<CommentIcon {...commentIconPosition} color={annotation.color!}/>
				)}
			</>,
			widgetContainer
		)}
	</>;
};
Highlight.displayName = 'Highlight';
type HighlightProps = {
	annotation: DisplayedAnnotation;
	selected: boolean;
	onPointerDown?: (event: React.PointerEvent) => void;
	onDragStart?: (dataTransfer: DataTransfer) => void;
	onResize?: (range: Range) => void;
	disablePointerEvents: boolean;
	widgetContainer: Element | null;
};

const Note: React.FC<NoteProps> = (props) => {
	let { annotation, staggerIndex, selected, onPointerDown, onDragStart, disablePointerEvents } = props;
	let iconRef = React.useRef<SVGSVGElement>(null);

	let doc = annotation.range.commonAncestorContainer.ownerDocument;
	if (!doc || !doc.defaultView) {
		return null;
	}

	let handleDragStart = (event: React.DragEvent) => {
		if (!onDragStart || annotation.comment === undefined) {
			return;
		}

		let elem = event.target as Element;
		let br = elem.getBoundingClientRect();
		event.dataTransfer.setDragImage(iconRef.current!, event.clientX - br.left, event.clientY - br.top);
		onDragStart(event.dataTransfer);
	};

	let rect = annotation.range.getBoundingClientRect();
	let rtl = getComputedStyle(closestElement(annotation.range.commonAncestorContainer!)!).direction === 'rtl';
	let staggerOffset = (staggerIndex || 0) * 15;
	return (
		<CommentIcon
			annotation={annotation}
			x={rect.x + (rtl ? -25 : rect.width + 25) + doc.defaultView!.scrollX + (rtl ? -1 : 1) * staggerOffset}
			y={rect.y + doc.defaultView!.scrollY + staggerOffset}
			color={annotation.color!}
			opacity={annotation.id ? '100%' : '50%'}
			selected={selected}
			large={true}
			onPointerDown={disablePointerEvents ? undefined : onPointerDown}
			onDragStart={disablePointerEvents ? undefined : handleDragStart}
			ref={iconRef}
		/>
	);
};
Note.displayName = 'Note';
type NoteProps = {
	annotation: DisplayedAnnotation,
	staggerIndex?: number,
	selected: boolean;
	onPointerDown?: (event: React.PointerEvent) => void;
	onDragStart?: (dataTransfer: DataTransfer) => void;
	disablePointerEvents: boolean;
};

const StaggeredNotes: React.FC<StaggeredNotesProps> = (props) => {
	let { annotations, selectedAnnotationIDs, onPointerDown, onDragStart, disablePointerEvents } = props;
	let staggerMap = new Map<string | undefined, number>();
	return <>
		{annotations.map((annotation) => {
			let stagger = staggerMap.has(annotation.sortIndex) ? staggerMap.get(annotation.sortIndex)! : 0;
			staggerMap.set(annotation.sortIndex, stagger + 1);
			if (annotation.id) {
				return (
					<Note
						annotation={annotation}
						staggerIndex={stagger}
						key={annotation.key}
						selected={selectedAnnotationIDs.includes(annotation.id)}
						onPointerDown={event => onPointerDown(event, annotation.id!)}
						onDragStart={dataTransfer => onDragStart(dataTransfer, annotation.id!)}
						disablePointerEvents={disablePointerEvents}
					/>
				);
			}
			else {
				return (
					<Note
						annotation={annotation}
						staggerIndex={stagger}
						key={annotation.key}
						selected={false}
						disablePointerEvents={true}
					/>
				);
			}
		})}
	</>;
};
StaggeredNotes.displayName = 'StaggeredNotes';
type StaggeredNotesProps = {
	annotations: DisplayedAnnotation[];
	selectedAnnotationIDs: string[];
	onPointerDown: (event: React.PointerEvent, id: string) => void;
	onDragStart: (dataTransfer: DataTransfer, id: string) => void;
	disablePointerEvents: boolean;
};

const SelectionBorder: React.FC<SelectionBorderProps> = React.memo((props) => {
	return (
		<rect
			x={props.rect.x + props.win.scrollX - 5}
			y={props.rect.y + props.win.scrollY - 5}
			width={props.rect.width + 10}
			height={props.rect.height + 10}
			fill="none"
			stroke="#6d95e0"
			strokeDasharray="10 6"
			strokeWidth={2}/>
	);
}, (prev, next) => JSON.stringify(prev.rect) === JSON.stringify(next.rect) && prev.win === next.win);
SelectionBorder.displayName = 'SelectionBorder';
type SelectionBorderProps = {
	rect: DOMRect;
	win: Window;
};

const RangeSelectionBorder: React.FC<RangeSelectionBorderProps> = (props) => {
	let rect = props.range.getBoundingClientRect();
	let win = props.range.commonAncestorContainer.ownerDocument!.defaultView!;
	return <SelectionBorder rect={rect} win={win}/>;
};
RangeSelectionBorder.displayName = 'RangeSelectionBorder';
type RangeSelectionBorderProps = {
	range: Range;
};

const Resizer: React.FC<ResizerProps> = (props) => {
	let WIDTH = 3;

	let [resizingSide, setResizingSide] = useState<false | 'start' | 'end'>(false);
	
	let rtl = getComputedStyle(closestElement(props.annotation.range.commonAncestorContainer!)!).direction == 'rtl';
	
	let highlightRects = Array.from(props.highlightRects)
		.sort((a, b) => (a.top - b.top) || (a.left - b.left));
	let topLeftRect = highlightRects[rtl ? highlightRects.length - 1 : 0];
	let bottomRightRect = highlightRects[rtl ? 0 : highlightRects.length - 1];
	
	let handlePointerDown = (event: React.PointerEvent, isStart: boolean) => {
		if (event.button !== 0) {
			return;
		}
		(event.target as Element).setPointerCapture(event.pointerId);
		setResizingSide(isStart ? 'start' : 'end');
		props.onPointerDown();
	};
	
	let handlePointerUp = (event: React.PointerEvent) => {
		if (event.button !== 0 || !(event.target as Element).hasPointerCapture(event.pointerId)) {
			return;
		}
		(event.target as Element).releasePointerCapture(event.pointerId);
		setResizingSide(false);
		props.onPointerUp();
	};

	let handleResize = (event: React.PointerEvent, isStart: boolean) => {
		let pos = caretPositionFromPoint(event.view.document, event.clientX, event.clientY);
		if (pos) {
			let newRange = props.annotation.range.cloneRange();
			if (isStart) {
				if (newRange.startContainer === pos.offsetNode && newRange.startOffset === pos.offset) {
					return;
				}
				newRange.setStart(pos.offsetNode, pos.offset);
			}
			else {
				if (newRange.endContainer === pos.offsetNode && newRange.endOffset === pos.offset) {
					return;
				}
				newRange.setEnd(pos.offsetNode, pos.offset);
			}
			props.onResize(newRange);
		}
	};

	let win = props.annotation.range.commonAncestorContainer.ownerDocument!.defaultView!;
	return <>
		<rect
			x={topLeftRect.x + win.scrollX - WIDTH}
			y={topLeftRect.y + win.scrollY}
			width={WIDTH}
			height={topLeftRect.height}
			fill={props.annotation.color}
			style={{ pointerEvents: 'all', cursor: 'col-resize' }}
			onPointerDown={event => handlePointerDown(event, true)}
			onPointerUp={event => handlePointerUp(event)}
			onPointerMove={resizingSide == 'start' ? (event => handleResize(event, !rtl)) : undefined}
		/>
		<rect
			x={bottomRightRect.right + win.scrollX}
			y={bottomRightRect.y + win.scrollY}
			width={WIDTH}
			height={bottomRightRect.height}
			fill={props.annotation.color}
			style={{ pointerEvents: 'all', cursor: 'col-resize' }}
			onPointerDown={event => handlePointerDown(event, false)}
			onPointerUp={event => handlePointerUp(event)}
			onPointerMove={resizingSide == 'end' ? (event => handleResize(event, rtl)) : undefined}
		/>
	</>;
};
Resizer.displayName = 'Resizer';
type ResizerProps = {
	annotation: DisplayedAnnotation;
	highlightRects: DOMRect[];
	onPointerDown: () => void;
	onPointerUp: () => void;
	onResize: (range: Range) => void;
};

let CommentIcon = React.forwardRef<SVGSVGElement, CommentIconProps>((props, ref) => {
	let size = props.large ? 24 : 14;
	let x = props.x - size / 2;
	let y = props.y - size / 2;
	return <>
		<svg
			color={props.color}
			opacity={props.opacity}
			x={x}
			y={y}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			ref={ref}
		>
			<IconNoteLarge/>
		</svg>
		{props.selected && (
			<SelectionBorder
				rect={new DOMRect(x, y, size, size)}
				win={window}
			/>
		)}
		{(props.onPointerDown || props.onDragStart || props.onDragEnd) && (
			<foreignObject
				x={x}
				y={y}
				width={size}
				height={size}
			>
				<div
					// @ts-ignore
					xmlns="http://www.w3.org/1999/xhtml"
					style={{
						pointerEvents: 'auto',
						cursor: 'pointer',
						width: '100%',
						height: '100%',
					}}
					draggable={true}
					onPointerDown={props.onPointerDown}
					onDragStart={props.onDragStart}
					onDragEnd={props.onDragEnd}
					data-annotation-id={props.annotation?.id}/>
			</foreignObject>
		)}
	</>;
});
CommentIcon.displayName = 'CommentIcon';
CommentIcon = React.memo(CommentIcon);
type CommentIconProps = {
	annotation?: { id?: string },
	x: number;
	y: number;
	color: string;
	opacity?: string | number;
	selected?: boolean;
	large?: boolean;
	onPointerDown?: (event: React.PointerEvent) => void;
	onDragStart?: (event: React.DragEvent) => void;
	onDragEnd?: (event: React.DragEvent) => void;
};