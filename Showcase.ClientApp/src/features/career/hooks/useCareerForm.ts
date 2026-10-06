import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export interface UseCareerFormConfig<T extends { id: string }, TPayload = Partial<T>> {
  loadAllFn: () => Promise<T[]>;
  createFn: (data: TPayload) => Promise<T>;
  updateFn: (id: string, data: TPayload) => Promise<T>;
  listPath: string;
  entityLabel: string;
}

export interface UseCareerFormReturn<T, TPayload = Partial<T>> {
  id: string | undefined;
  isEditing: boolean;
  isLoading: boolean;
  isSaving: boolean;
  item: T | null;
  handleSave: (payload: TPayload, validate?: () => boolean) => Promise<void>;
  handleCancel: () => void;
}

export function useCareerForm<T extends { id: string }, TPayload = Partial<T>>(
  config: UseCareerFormConfig<T, TPayload>
): UseCareerFormReturn<T, TPayload> {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [item, setItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    if (!isEditing || !id) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const items = await configRef.current.loadAllFn();
        if (cancelled) return;
        const found = items.find((i) => i.id === id) ?? null;
        if (isMounted.current) {
          if (found) {
            setItem(found);
          } else {
            toast.error(`${configRef.current.entityLabel} not found`);
            navigate(configRef.current.listPath);
          }
        }
      } catch {
        if (!cancelled && isMounted.current) {
          toast.error(`Failed to load ${configRef.current.entityLabel.toLowerCase()}`);
          navigate(configRef.current.listPath);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, navigate]);

  const handleSave = async (payload: TPayload, validate?: () => boolean): Promise<void> => {
    if (validate && !validate()) return;

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await configRef.current.updateFn(id, payload);
        toast.success(`${configRef.current.entityLabel} updated`);
      } else {
        await configRef.current.createFn(payload);
        toast.success(`${configRef.current.entityLabel} added`);
      }
      navigate(configRef.current.listPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to save ${configRef.current.entityLabel.toLowerCase()}`;
      toast.error(msg);
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    navigate(configRef.current.listPath);
  };

  return {
    id,
    isEditing,
    isLoading,
    isSaving,
    item,
    handleSave,
    handleCancel,
  };
}
