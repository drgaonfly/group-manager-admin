/**
 * Extracts the path from a given URL, optionally removing the leading slash.
 * @param urlString The URL from which to extract the path.
 * @param removeLeadingSlash Indicates whether to remove the leading slash from the path. Defaults to true.
 * @returns The extracted path from the URL.
 */
const extractPathFromUrl = (urlString: string, removeLeadingSlash: boolean = true): string => {
  try {
    const parsedUrl = new URL(urlString);
    let pathname = parsedUrl.pathname;

    // If requested, remove the leading slash from the pathname
    if (removeLeadingSlash && pathname.startsWith('/')) {
      pathname = pathname.substring(1);
    }

    return pathname;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return ''; // Return an empty string or handle it as you see fit
  }
};

// Example usage
export default extractPathFromUrl;
