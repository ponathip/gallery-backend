export function parseVideoEmbed(input = "") {
  const raw = String(input || "").trim();

  if (!raw) {
    return {
      platform: null,
      video_url: null,
      video_embed_url: null,
    };
  }

  const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1];
  const url = iframeSrc || raw;

  // YouTube
  const youtubeMatch =
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/youtube\.com\/shorts\/([^?&]+)/);

  if (youtubeMatch) {
    const id = youtubeMatch[1];
    return {
      platform: "youtube",
      video_url: url,
      video_embed_url: `https://www.youtube.com/embed/${id}`,
    };
  }

  // TikTok
  const tiktokMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return {
      platform: "tiktok",
      video_url: url,
      video_embed_url: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
    };
  }

  // Instagram post/reel
  const instagramMatch = url.match(
    /instagram\.com\/(p|reel|tv)\/([^/?#]+)/,
  );

  if (instagramMatch) {
    const type = instagramMatch[1];
    const code = instagramMatch[2];

    return {
      platform: "instagram",
      video_url: url,
      video_embed_url: `https://www.instagram.com/${type}/${code}/embed`,
    };
  }

  // Facebook iframe/plugin
  if (url.includes("facebook.com/plugins/video.php")) {
    return {
      platform: "facebook",
      video_url: url,
      video_embed_url: url,
    };
  }

  // Facebook normal/reel/share URL
  if (url.includes("facebook.com")) {
    return {
      platform: "facebook",
      video_url: url,
      video_embed_url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url,
      )}&show_text=false&width=734`,
    };
  }

  return {
    platform: "other",
    video_url: url,
    video_embed_url: url,
  };
}