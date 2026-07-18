import "server-only";

export async function getServerNow() {
  return new Date();
}
