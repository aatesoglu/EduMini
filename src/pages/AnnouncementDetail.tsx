import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import api from "../utils/api";

type Announcement = {
  id: number;
  title: string;
  content?: string;
  createdAt?: string;
};

export default function AnnouncementDetail() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get<{
          status: string;
          data: { announcement: Announcement };
        }>(`/announcements/${id}`);
        if (res.data.status === "success")
          setAnnouncement(res.data.data.announcement);
      } catch (err) {
        console.error(err);
      }
    };
    if (id) fetchAnnouncement();
  }, [id]);

  if (!announcement)
    return (
      <PageWrapper>
        <div className="p-8">Duyuru bulunamadı</div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">{announcement.title}</h1>
        <div className="prose">
          <div
            dangerouslySetInnerHTML={{ __html: announcement.content || "" }}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
