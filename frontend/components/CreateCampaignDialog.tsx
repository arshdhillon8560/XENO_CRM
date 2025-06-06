'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Campaign, CampaignFormData, CampaignStatus, Segment } from '@/types/campaign';

interface CreateCampaignDialogProps {
  onCampaignCreated?: (newCampaign: Campaign) => void;
  triggerText?: string;
  className?: string;
}

export default function CreateCampaignDialog({
  onCampaignCreated,
  triggerText = "Create New Campaign",
  className = "",
}: CreateCampaignDialogProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    segmentId: '',
    message: '',
    status: 'pending',
  });

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/segments`
        );
        setSegments(res.data.data);
      } catch (err) {
        console.error('Failed to fetch segments:', err);
        alert('Failed to load segments');
      }
    };

    fetchSegments();
  }, []);

  const handleSubmit = async () => {
    const { name, segmentId, message, status } = formData;

    if (!name || !segmentId || !message || !status) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/campaigns`,
        { name, segmentId, message, status },
        { withCredentials: true }
      );

      const newCampaign: Campaign = {
        ...res.data.data,
        segmentId: segments.find(s => s._id === segmentId) || segmentId
      };

      alert('✅ Campaign created!');
      setFormData({
        name: '',
        segmentId: '',
        message: '',
        status: 'pending',
      });

      if (onCampaignCreated) {
        onCampaignCreated(newCampaign);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (value: string) => {
    if (isCampaignStatus(value)) {
      setFormData({ ...formData, status: value });
    }
  };

  function isCampaignStatus(status: string): status is CampaignStatus {
    return ['pending', 'sent', 'delivered', 'failed'].includes(status);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={`bg-[#A9DFD8] text-black hover:bg-[#61c9bb] transition-colors duration-200 ${className}`}
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#02675a]">Create Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Campaign name"
            />
          </div>

          <div>
            <Label htmlFor="segmentId">Segment</Label>
            <Select
              value={formData.segmentId}
              onValueChange={(value) =>
                setFormData({ ...formData, segmentId: value })
              }
            >
              <SelectTrigger id="segmentId" className="w-full">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((segment) => (
                  <SelectItem key={segment._id} value={segment._id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Campaign message"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#A9DFD8] text-black hover:bg-[#61c9bb] transition-colors duration-200"
          >
            {loading ? 'Creating...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}