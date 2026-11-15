from langgraph.graph import StateGraph, START, END

from app.graph.nodes import (
    download_reel_node,
    extract_audio_node,
    transcribe_node,
    summarize_node,
    create_chunks_node,
    create_embeddings_node,
    store_embeddings_node,
    no_speech_node,
    audio_done_node,
    extract_frames_node,
    understand_frames_node,
    store_visual_embeddings_node,
    finalize_processing_node,
)
from app.graph.state import ReelState


def route_after_transcribe(state: ReelState) -> str:
    has_text = (state.get("transcript") or "").strip()
    return "summarize" if has_text else "no_speech"


def build_reel_graph():
    builder = StateGraph(ReelState)

    # Nodes
    builder.add_node("download", download_reel_node)

    # Audio branch
    builder.add_node("extract_audio", extract_audio_node)
    builder.add_node("transcribe", transcribe_node)
    builder.add_node("summarize", summarize_node)
    builder.add_node("create_chunks", create_chunks_node)
    builder.add_node("generate_embeddings", create_embeddings_node)
    builder.add_node("store_embeddings", store_embeddings_node)
    builder.add_node("no_speech", no_speech_node)
    builder.add_node("audio_done", audio_done_node)

    # Visual branch
    builder.add_node("extract_frames", extract_frames_node)
    builder.add_node("understand_frames", understand_frames_node)
    builder.add_node("store_visual_embeddings", store_visual_embeddings_node)

    # Finalizer node
    builder.add_node("finalize_processing", finalize_processing_node)

    # Start
    builder.add_edge(START, "download")

    # Parallel split
    builder.add_edge("download", "extract_audio")
    builder.add_edge("download", "extract_frames")

    # Audio flow
    builder.add_edge("extract_audio", "transcribe")
    builder.add_conditional_edges(
        "transcribe",
        route_after_transcribe,
        {
            "summarize": "summarize",
            "no_speech": "no_speech",
        },
    )
    builder.add_edge("summarize", "create_chunks")
    builder.add_edge("create_chunks", "generate_embeddings")
    builder.add_edge("generate_embeddings", "store_embeddings")
    builder.add_edge("store_embeddings", "audio_done")
    builder.add_edge("no_speech", "audio_done")

    # Visual flow
    builder.add_edge("extract_frames", "understand_frames")
    builder.add_edge("understand_frames", "store_visual_embeddings")

    # Synchronize both branches into the finalizer
    builder.add_edge(["audio_done", "store_visual_embeddings"], "finalize_processing")
    builder.add_edge("finalize_processing", END)

    return builder.compile()


def build_pipeline_graph():
    """Graph starting from already downloaded video (runs audio + visual analysis in parallel)."""
    builder = StateGraph(ReelState)

    # Audio branch
    builder.add_node("extract_audio", extract_audio_node)
    builder.add_node("transcribe", transcribe_node)
    builder.add_node("summarize", summarize_node)
    builder.add_node("create_chunks", create_chunks_node)
    builder.add_node("generate_embeddings", create_embeddings_node)
    builder.add_node("store_embeddings", store_embeddings_node)
    builder.add_node("no_speech", no_speech_node)
    builder.add_node("audio_done", audio_done_node)

    # Visual branch
    builder.add_node("extract_frames", extract_frames_node)
    builder.add_node("understand_frames", understand_frames_node)
    builder.add_node("store_visual_embeddings", store_visual_embeddings_node)

    # Finalizer node
    builder.add_node("finalize_processing", finalize_processing_node)

    # Start: splits into extract_audio and extract_frames
    builder.add_edge(START, "extract_audio")
    builder.add_edge(START, "extract_frames")

    # Audio flow
    builder.add_edge("extract_audio", "transcribe")
    builder.add_conditional_edges(
        "transcribe",
        route_after_transcribe,
        {
            "summarize": "summarize",
            "no_speech": "no_speech",
        },
    )
    builder.add_edge("summarize", "create_chunks")
    builder.add_edge("create_chunks", "generate_embeddings")
    builder.add_edge("generate_embeddings", "store_embeddings")
    builder.add_edge("store_embeddings", "audio_done")
    builder.add_edge("no_speech", "audio_done")

    # Visual flow
    builder.add_edge("extract_frames", "understand_frames")
    builder.add_edge("understand_frames", "store_visual_embeddings")

    # Synchronize both branches into the finalizer
    builder.add_edge(["audio_done", "store_visual_embeddings"], "finalize_processing")
    builder.add_edge("finalize_processing", END)

    return builder.compile()


reel_graph = build_reel_graph()
pipeline_graph = build_pipeline_graph()