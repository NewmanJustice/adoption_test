import { Router } from 'express';
import { Database } from 'sql.js';

type AnchorType = 'element' | 'rect';
interface ElementAnchor {
    selector: string;
    xpath?: string;
    textContent?: string;
}
interface RectAnchor {
    x: number;
    y: number;
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    viewportWidth: number;
    viewportHeight: number;
}
type AnchorPayload = ElementAnchor | RectAnchor;
interface Annotation {
    id: string;
    url_full: string;
    url_canonical: string;
    title: string;
    body: string;
    anchor_type: AnchorType;
    anchor_payload: AnchorPayload;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    created_by: string;
    updated_by: string;
}
interface CreateAnnotationInput {
    url_full: string;
    title: string;
    body: string;
    anchor_type: AnchorType;
    anchor_payload: AnchorPayload;
    actor: string;
}
interface UpdateAnnotationInput {
    title?: string;
    body?: string;
    anchor_type?: AnchorType;
    anchor_payload?: AnchorPayload;
    actor: string;
}
type EventType = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'EXPORT_PROMPT';
interface AnnotationEvent {
    id: string;
    annotation_id: string | null;
    event_type: EventType;
    actor: string;
    timestamp: string;
    diff: Record<string, {
        old: unknown;
        new: unknown;
    }> | null;
    meta: Record<string, unknown> | null;
}
interface PromptExport {
    id: string;
    created_at: string;
    actor: string;
    url_scope: string[];
    annotation_ids: string[];
    template_id: string;
    prompt_markdown: string;
    saved_path_md: string;
    saved_path_json: string;
}
interface GeneratePromptInput {
    urls: string[];
    annotation_ids?: string[];
    template_id?: string;
    enhance_with_ai?: boolean;
    actor: string;
}
interface GeneratedPrompt {
    markdown: string;
    annotations: Annotation[];
    enhanced: boolean;
}
interface PageSummary {
    url_canonical: string;
    annotation_count: number;
    latest_annotation_at: string;
}
type UrlMode = 'full' | 'canonical';
type ActorMode = 'prompt' | 'anonymous' | 'fixed';
interface PrototypeAnnotatorConfig {
    basePath?: string;
    dbPath?: string;
    exportDir?: string;
    defaultActor?: string;
    enableOverlay?: boolean;
    enableDashboard?: boolean;
    urlMode?: UrlMode;
    actorMode?: ActorMode;
}
interface ResolvedConfig {
    basePath: string;
    dbPath: string;
    exportDir: string;
    defaultActor: string;
    enableOverlay: boolean;
    enableDashboard: boolean;
    urlMode: UrlMode;
    actorMode: ActorMode;
}
interface ClientConfig {
    basePath: string;
    apiUrl: string;
    defaultActor: string;
    actorMode: ActorMode;
}
interface PrototypeAnnotatorMiddleware {
    middleware: () => Router;
    router: Router;
    injector: (req: any, res: any, next: () => void) => void;
    config: ResolvedConfig;
}
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

declare function createPrototypeAnnotator(userConfig?: PrototypeAnnotatorConfig): Promise<PrototypeAnnotatorMiddleware>;

declare class DatabaseWrapper {
    private db;
    private dbPath;
    private saveTimeout;
    constructor(db: Database, dbPath: string);
    prepare(sql: string): StatementWrapper;
    exec(sql: string): void;
    pragma(_pragma: string): void;
    close(): void;
    private scheduleSave;
    private saveNow;
}
declare class StatementWrapper {
    private db;
    private sql;
    private onWrite;
    constructor(db: Database, sql: string, onWrite: () => void);
    run(...params: unknown[]): void;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
}
declare function getDatabase(): DatabaseWrapper;
declare function initDatabase(dbPath: string): DatabaseWrapper;
declare function closeDatabase(): void;

declare function resolveConfig(input?: PrototypeAnnotatorConfig): ResolvedConfig;
declare function getClientConfig(config: ResolvedConfig): {
    basePath: string;
    apiUrl: string;
    defaultActor: string;
    actorMode: ActorMode;
};

export { type AnchorPayload, type AnchorType, type Annotation, type AnnotationEvent, type ApiResponse, type ClientConfig, type CreateAnnotationInput, type ElementAnchor, type EventType, type GeneratePromptInput, type GeneratedPrompt, type PageSummary, type PaginatedResponse, type PromptExport, type PrototypeAnnotatorConfig, type PrototypeAnnotatorMiddleware, type RectAnchor, type ResolvedConfig, type UpdateAnnotationInput, closeDatabase, createPrototypeAnnotator, getClientConfig, getDatabase, initDatabase, resolveConfig };
